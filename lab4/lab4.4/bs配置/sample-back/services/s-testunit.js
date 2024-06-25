/**
 * 获取持久化的监测单元或调用数据组件进行原始xml操作
 */

/**
 * @param {*} unitItem 单个传感器信息
 * @param {*} front 用来区别请求的来源前端作参数过滤
 * @returns 单位解析后的传感器信息
 */
function decodeUnit(unitItem, front = true) {
  let tempArr = unitItem.Unit.split("-");
  if (tempArr.length == 1) {
    //兼容只有单位的情况
    unitItem.env = "A";
    unitItem.originUnit = unitItem.Unit;
    unitItem.unit = tempArr[0];
    unitItem.control = "F";
  } else if (tempArr.length >= 3) {
    //扩展单位，三参数
    unitItem.originUnit = unitItem.Unit;
    unitItem.env = tempArr[0];
    if (front) {
      unitItem.unit = tempArr[1];
    } else {
      unitItem.unit = tempArr[1].split('*')[0];
    }
    unitItem.control = tempArr[2];
    if (tempArr[2] == "T") {
      //兼容三参数
      unitItem.controlType = "B"; //默认开关量
    }
    if (tempArr.length == 4) {
      //兼容四参数
      unitItem.controlType = tempArr[3];
    }
    if (tempArr.length == 5) {
      //兼容五参数
      unitItem.effect = tempArr[4];
    }
  }
  return unitItem;
}

//获取最新监测状态
async function getTestUnitStatus(ctx, {
  ip,
  port,
  ProjectCode
}) {
  let temp = await ctx._request({
    url: ctx.apis.getTestUnitStatus.URI,
    method: ctx.apis.getTestUnitStatus.method,
    params: {
      ip,
      port,
      ProjectCode,
    },
  });
  return temp;
}

//获取监测单元历史数据表头
function getTestUnitHistoryHeader(testUnitId, ctx) {
  ctx.log4js.logInfo("---获取监测单元历史数据表头---");
  let testUnits = ctx.getJson("temp_data", "TestUnits"),
    testUnit,
    headers = [];
  if (testUnitId in testUnits) {
    testUnit = testUnits[testUnitId];
    //过滤控制参数
    ctx.log4js.logInfo("---过滤控制参数---");
    for (let i of testUnit.SensorInfo) {
      let tempSensor = decodeUnit(i, true);
      if (tempSensor.control != "T" && tempSensor.unit != "`") {
        headers.push({
          unit: tempSensor.unit,
          prop: i.EnName,
          label: i.Name,
        });
      }
    }
  }
  return headers;
}

//根据监测单元号获取监测单元
function getTestUnit(testUnitIds, ctx) {
  ctx.log4js.logInfo("---读取TestUnits.json---");
  let testUnits = ctx.getJson("temp_data", "TestUnits"),
    result = [];
  if (Object.prototype.toString.call(testUnitIds).indexOf("Array") != -1) {
    //判断参数是数组
    for (let item of testUnitIds) {
      if (item in testUnits) {
        result.push(testUnits[item]);
      }
    }
  } else {
    //参数是单个值
    if (testUnitIds in testUnits) {
      result = testUnits[testUnitIds];
    }
  }
  ctx.log4js.logInfo("---返回监测单元信息---");
  return result;
}

function getAllTestUnit(ctx) {
  ctx.log4js.logInfo("---读取TestUnits.json---");
  let testUnits = ctx.getJson("temp_data", "TestUnits"),
    result = [];

  result = testUnits["all"];

  ctx.log4js.logInfo("---返回全部监测单元信息---");
  return result;
}

//开始监测
async function openTest(ctx, {
  ProjectCode,
  testUnitNo,
  content
}) {
  let temp = await ctx._request({
    url: ctx.apis.openTest.URI,
    method: ctx.apis.openTest.method,
    params: {
      testUnit: testUnitNo,
      projectCode: ProjectCode,
      content: content
    },
  });
  await ctx._request({
    url: ctx.apis.publish.URI,
    method: ctx.apis.publish.method,
    params: {},
  });

  return temp;
}

//停止监测
async function stopTest(ctx, {
  ProjectCode,
  testUnitNo
}) {
  let temp = await ctx._request({
    url: ctx.apis.stopTest.URI,
    method: ctx.apis.stopTest.method,
    params: {
      testUnit: testUnitNo,
      projectCode: ProjectCode,
    },
  });
  await ctx._request({
    url: ctx.apis.publish.URI,
    method: ctx.apis.publish.method,
    params: {},
  });
  return temp;
}

async function uploadMetaData(ctx) {
  //查询监测单元状态
  let testUnitRecordsres = await ctx._request({
    url: ctx.apis.getTestUnitStatus.URI,
    method: ctx.apis.getTestUnitStatus.method,
    params: {
      ip: ctx.request.query.ip,
      port: ctx.request.query.port,
      ProjectCode: ctx.request.query.ProjectCode,
    },
  });
  let testUnitStatus = JSON.parse(testUnitRecordsres.data);
  let index = testUnitStatus.testUnitNo.indexOf(
    parseInt(ctx.request.query.testUnitNo)
  );
  let params = {
    primaryKey: "",
    projectCode: "",
    content: "",
    BeginTime: "",
    url: "",
  };
  if (index != -1) {
    params.BeginTime = testUnitStatus.beginDateTime[index];
    params.projectCode = ctx.request.query.ProjectCode;
    params.primaryKey = (
      params.BeginTime + ctx.request.query.testUnitNo
    ).replace(" ", "");
    params.content = ctx.request.query.content;
    params.url = `${ctx.request.query.origin}/index.html#nav=2-1&node=${ctx.request.query.testUnitNo}&primarykey=${params.primaryKey}`;
    //上传本地元数据
    let a = await ctx._request({
      url: ctx.OSapi.baseURL + ctx.OSapi.receiveMetadata.URI,
      method: ctx.OSapi.receiveMetadata.method,
      params: params,
    });
    console.log(a);
    return true;
  } else {
    return false;
  }
}

/**
 * 获取监测单元内视频通道信息
 * @param {*} testUnitId 
 * @param {*} ctx 
 * @returns 
 */
function getTestUnitVideoInfo(testUnitId, ctx) {
  ctx.log4js.logInfo("---获取监测单元下视频相关数据---");
  let testUnits = ctx.getJson("temp_data", "TestUnits"),
    testUnit,
    sensorList = [],
    videoList = [];
  if (testUnitId in testUnits) {
    testUnit = testUnits[testUnitId];
    for (let j of testUnit.VideoInfo) {
      videoList.push({
        IoTGateNo: j.IoTGateNo,
        nvrUserId: j.Username, //nvr⽤户名
        nvrPassword: j.Password, //nvr密码
        nvrIp: j.IP, //nvrIP地址
        nvrType: j.nvrType, //nvr类型 1代表海康 2代表华为 3 代表⼤华
        device_type: "IPC", //设备类型
        play_type: "PLAYBACK", //播放类型
        channel: j.ChannelNo, //NVR通道
        stream_type: "flv", //转码类型，默认flv
      });
    }
  }
  return videoList;
}


module.exports.getTestUnit = getTestUnit;
module.exports.getAllTestUnit = getAllTestUnit;
module.exports.getTestUnitHistoryHeader = getTestUnitHistoryHeader;
module.exports.getTestUnitStatus = getTestUnitStatus;
module.exports.openTest = openTest;
module.exports.stopTest = stopTest;
module.exports.uploadMetaData = uploadMetaData;
module.exports.decodeUnit = decodeUnit;
module.exports.getTestUnitVideoInfo = getTestUnitVideoInfo;