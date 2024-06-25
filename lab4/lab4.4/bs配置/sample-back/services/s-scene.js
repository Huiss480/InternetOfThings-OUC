/**
 * 获取场景内导航及监测单元信息
 */
const crypto = require("crypto");

//字符串转sha256字符串
function str2sha256(str) {
  var reponse = crypto.createHash("SHA256").update(str).digest("hex");
  return reponse;
}

/**
 * 获取导航节点及其包含监测单元信息
 * @param {*} NavId 导航节点号
 * @param {*} ctx 请求上下文
 */
function getSceneInitInfo(NavId, ctx) {
  ctx.log4js.logInfo("---获取导航节点及其包含监测单元信息---");
  let params = {
    map: null,
    data: {
      list: [],
    },
  };
  //获取导航节点原始信息
  let tempNavs = ctx.getJson("temp_data", "NavigationOrigin"),
    tempNav = {};
  if (NavId in tempNavs) {
    tempNav = tempNavs[NavId];
  }
  //整合导航节点信息
  params.map = {
    id: "_map",
    name: tempNav.Name,
    desc: tempNav.Description,
  };

  //获取导航下监测单元号
  let testUnitsIndex = ctx.getJson("temp_data", "NavIncludesUnit"),
    testUnits = [];
  if (NavId in testUnitsIndex) {
    testUnits = testUnitsIndex[NavId];
  }
  //读取监测单元信息文件
  let testUnitsInfo = ctx.getJson("temp_data", "TestUnits");
 
  //循环获取监测单元原始信息和监测单元位置信息并进行整合
  for (let i of testUnits) {
    console.log(i);
    let unitInfo = {},
      unitLoca = null;
    if (i in testUnitsInfo) {
      unitInfo = testUnitsInfo[i];
    } else {}

    params.data.list.push({
      id: unitInfo.TestUnitNo,
      title: unitInfo.TestUnitName,
      desc: "",
    });
  }
  return params;
}

/**
 * 获取监测单元实时数据相关参数图例
 * @param {*} testUnitId
 * @param {*} ctx
 * @returns
 */
function getTestUnitCurrentDatalegend(testUnitId, ctx) {
  ctx.log4js.logInfo("---获取监测单元下传感器相关数据---");
  let testUnits = ctx.getJson("temp_data", "TestUnits"),
    testUnit,
    sensorList = [],
    videoList = [];
  if (testUnitId in testUnits) {
    testUnit = testUnits[testUnitId];
    for (let i of testUnit.SensorInfo) {
      sensorList.push({
        id: i.SensorNo,
        prop: i.EnName,
        name: i.Name,
        unit: i.Unit,
        dot: i.DotNum,
        instrumentId: i.InstrumentId,
        instrumentType: i.InstrumentType,
        IoTGateNo: i.IoTGateNo,
      });
    }
    for (let j of testUnit.VideoInfo) {
      videoList.push({
        IoTGateNo: j.IoTGateNo,
        nvrUserId: j.Username, //nvr⽤户名
        nvrPassword: j.Password, //nvr密码
        nvrIp: j.IP, //nvrIP地址
        nvrType: j.nvrType, //nvr类型 1代表海康 2代表华为 3 代表⼤华
        device_type: "IPC", //设备类型
        play_type: "REAL", //播放类型
        channel: j.ChannelNo, //NVR通道
        stream_type: "flv", //转码类型，默认flv
      });
    }
  }
  return {
    sensorList,
    videoList,
  };
}


//生成普通采集payload
function createPayLoad(query) {
  let order = null;
  query.controlValue = parseInt(query.controlValue),
    query.gapMin = parseInt(query.gapMin),
    query.gapMax = parseInt(query.gapMax)
  switch (query.instrument_type) {
    case "SmartLight":
      order = light_control.orderFactory(
        query
      );
      break;
  }
  //以后加上返回mqtt消息处理函数
  return {
    msg_id: str2sha256(new Date().toISOString()),
    type: "controlcmd",
    data: {
      order: order,
      loop: 0,
    },
  };
}
//生成视频采集payload
function createVideoPayLoad(body) {
  return {
    msg_id: str2sha256(new Date().toISOString()),
    data: {
      device_info: body.deviceInfo,
      control_info: {
        type: body.PTZ,
        step: 1,
      },
    },
  };
}

//发布主题 ctx内query需要包含设备号，控制值，控制设备类型
function publishOrder(ctx) {
  return new Promise((resolve, reject) => {
    let payload = createPayLoad(ctx.request.query);
    console.log(payload);
    let mqttclient = ctx.Mqtt;
    if (mqttclient.connected) {
      let flag = false;
      //订阅主题
      mqttclient.client.subscribe(
        `/gate_${ctx.request.query.IoTGateNo}/dass/upload_SensorData`,
        function (err) {
          console.log("suberr", err);
          if (!err) {
            //消息处理
            mqttclient.client.once("message", (topic, message) => {
              let res = JSON.parse(message.toString());
              if (!flag) {
              
                if (
                  topic ==
                  `/gate_${ctx.request.query.IoTGateNo}/dass/upload_SensorData` 
                  &&
                  res.msg_id == payload.msg_id
                  && !res.timestamp
                ) {
                  flag = true;
                  //判断返回结果
                  let exec = false;
                  switch (ctx.request.query.instrument_type) {
                    case 'SmartLight':
                      console.log(res)
                      exec = light_control.checkReply(ctx.request.query, res.result.data)
                      break;
                  }
                  if (exec) {
                    resolve(true);
                  } else {
                    resolve(false);
                  }

                }

              }

            });

            //发布主题
            mqttclient.client.publish(
              `/gate_${ctx.request.query.IoTGateNo}/dass/order`,
              JSON.stringify(payload),
              function (err) {
                console.log("puberr", err);
                if (err != undefined) {
                  if (!flag) {
                    flag = true;
                    resolve(false);
                  }
                } else {
                  //发布主题后开始计时5s 判断超时
                  // resolve(true);
                  setTimeout(function () {
                    if (!flag) { //5s内没变，则表示超时
                      flag = true;
                      console.log('超时')
                      resolve(false);
                    }
                  }, 5000);
                }
              }
            );
          } else {
            resolve(false);
          }
        }
      );
    } else {
      resolve(false);
    }
  });
}

//发布主题 ctx内body需要包含视频通道信息，控制值，控制设备类型
function publishVideoOrder(ctx) {
  return new Promise((resolve, reject) => {
    let payload = createVideoPayLoad(ctx.request.body);
    console.log(payload);
    let mqttclient = ctx.Mqtt;
    if (mqttclient.connected) {
      //订阅主题
      mqttclient.client.subscribe(
        `/gate_${ctx.request.body.IoTGateNo}/video/ptz_control_reply`,
        function (err) {
          console.log("suberr", err);
          if (!err) {
            //消息处理
            mqttclient.client.on("message", (topic, message) => {
              let res = JSON.parse(message.toString());
              if (
                topic ==
                `/gate_${ctx.request.query.IoTGateNo}/video/ptz_control_reply` &&
                res.msg_id == payload.msg_id
              )
                //判断返回结果
                resolve(true);
            });

            //发布主题
            mqttclient.client.publish(
              `/gate_${ctx.request.body.IoTGateNo}/video/ptz_control`,
              JSON.stringify(payload),
              function (err) {
                console.log("puberr", err);
                if (err != undefined) {
                  reject(false);
                } else {
                  resolve(true);
                }
              }
            );
          } else {
            reject(false);
          }
        }
      );
    } else {
      reject(false);
    }
  });
}
module.exports.getSceneInitInfo = getSceneInitInfo;
module.exports.getTestUnitCurrentDatalegend = getTestUnitCurrentDatalegend;
module.exports.publishOrder = publishOrder;
module.exports.publishVideoOrder = publishVideoOrder;