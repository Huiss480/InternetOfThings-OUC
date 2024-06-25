/**
 * @author: Pt
 * 调用接口操作数据组件 xml和json互转 ，临时保存
 */

const request = require("../utils/request-filter.js"),
  apis = require("../config/apis.js").http_apis,
  X2js = require("../utils/jsonxml.js"),
  groupBy = require("../utils/group.js").groupBy;
const log4js = require("../logger/log4js");
const { saveJson, getJson } = require("../data_source/source_init.js");

async function appInit(ProjectCode) {
  let beforeInit = await request({
    url: apis.receiveDataObject.URI,
    method: apis.receiveDataObject.method,
    params: {},
  });
  if (beforeInit.code == 20001) { 
    //初始化
    let appInit = await request({
      url: apis.MainController.URI,
      method: apis.MainController.method,
      params: {
        projectCode: ProjectCode,
      },
    });
    if (appInit.code == 20000) {
      return true;
    } else {
      return false;
    }
  } else {
    //不做任何处理
    return true;
  }
}

//获取comconfig的连接信息 ip和端口
function getConfigFile(projectCode) {
  return request({
    url: apis.getConfigFile.URI,
    method: apis.getConfigFile.method,
    params: {
      projectCode: projectCode,
    },
  });
}

//获取某个组件的所有记录
async function DownloadAllComponentConfig({
  ip,
  port,
  ProjectCode,
  ComponentName,
  testUnitId,
}) {
  log4js.logInfo(`---获取${ComponentName}组件所有配置---`);
  let temp = await request({
    url: apis.DownloadAllComponentConfig.URI,
    method: apis.DownloadAllComponentConfig.method,
    params: {
      ip,
      port,
      ProjectCode,
      ComponentName,
    },
  });
  let x2js = new X2js(),
    tempJsons;
  tempJsons = CommconfigHandlerX2J(temp.data, x2js);
  return {
    ComponentName,
    tempJsons,
    testUnitId,
  };
}

//获取某个监测单元的所有开测记录
function testHistoryHandler({ ComponentName, tempJsons, testUnitId }) {
  //console.log(ComponentName, tempJsons[0].Config, testUnitId)
  let testRecords = [];
  tempJsons.forEach((e, i, a) => {
    // console.log(e)
    if (
      e.Config.TestUnitInfo.TestUnitNo == testUnitId + "" &&
      e.Config.TestUnitInfo.BeginDateTime != ""
    ) {
      testRecords.push({
        label: e.Config.TestUnitInfo.BeginDateTime,
        value:
          e.Config.TestUnitInfo.BeginDateTime.replace(" ", "") + testUnitId,
      });
    }
  });
  return testRecords;
}

//获取项目下XML配置并持转换为json文件
async function DownloadComponentConfig({
  ip,
  port,
  ProjectCode,
  ComponentName,
}) {
  log4js.logInfo(`---获取${ComponentName}组件配置---`);
  let temp = await request({
    url: apis.DownloadComponentConfig.URI,
    method: apis.DownloadComponentConfig.method,
    params: {
      ip,
      port,
      ProjectCode,
      ComponentName,
    },
  });
  let x2js = new X2js(),
    tempJsons;
  tempJsons = CommconfigHandlerX2J(temp.data, x2js);
  return {
    ComponentName,
    tempJsons,
  }; //返回组件名和组件的json原始格式
}

//将json配置持久化为应用软件需要格式的json文件
function persistenceJSON({ ComponentName, tempJsons }) {
  log4js.logInfo(`---${ComponentName}组件配置转换---`);
  let jsondata = {};
  switch (ComponentName) {
    //数据组件、元数据、曲线显示都是按监测单元的，但是目前没有这个步骤
    case "DataComm":
      jsondata = dataCommHandler(tempJsons); //nodemon环境需要修改nodemon.json配置文件，因为文件变化会重启程序。
      saveJson("temp_data", "TestUnits", jsondata);
      return jsondata;
    case "Nameplate":
      jsondata = namePlateHandler(tempJsons);
      saveJson("temp_data", "Nameplate", {
        Nameplate: jsondata,
      });
      return jsondata;
    case "Navigation":
      jsondata = navigationHandler(tempJsons);
      saveJson("temp_data", "Navigation", {
        Navigation: jsondata,
      });
      return jsondata;
    case "CurveControl":
      jsondata = curveControlHandler(tempJsons);
      saveJson("temp_data", "CurveControl", jsondata);
      return jsondata;
    case "SystemInfo":
      jsondata = systemInfoHandler(tempJsons);
      saveJson("temp_data", "SystemInfo", {
        SystemInfo: jsondata,
      });
      return jsondata;
    default:
      return {};
  }
}

/**
 * 持久化监测单元数据
 * @param {*} jsonArray
 */
function dataCommHandler(jsonArray) {
  let testunits = {
    all: [],
  };

  for (let index in jsonArray) {
    let testunit = jsonArray[index].Config.TestUnitInfo;
    testunit.SensorInfoByGateNo = groupBy(
      "IoTGateNo",
      testunit.SensorInfo.Sensor
    ); //单网关没有IotGateNo，所以会聚合到undefined,多网关不存在这个问题
    testunit.SensorInfo = testunit.SensorInfo.Sensor;

    try {
      if (
        Object.prototype.toString.call(testunit.VideoInfo.ChannelInfo) ==
        "[object Array]"
      ) {
        testunit.VideoInfo = testunit.VideoInfo.ChannelInfo;
      } else if (
        Object.prototype.toString.call(testunit.VideoInfo.ChannelInfo) ==
        "[object Object]"
      ) {
        let tempChannel = testunit.VideoInfo.ChannelInfo;
        testunit.VideoInfo = [];
        testunit.VideoInfo.push(tempChannel); //长度为1时是个对象
      } else {
        testunit.VideoInfo = [];
      }
      testunit.VideoInfoByGateNo = groupBy("IoTGateNo", testunit.VideoInfo);
    } catch (e) {
      //console.log("error", e);
      testunit.VideoInfo = [];
      testunit.VideoInfoByGateNo = {};
    }
    testunits[`${testunit.TestUnitNo}`] = testunit;
    testunits.all.push(testunit);
  }
  return testunits;
}
/**
 * 持久化元数据
 * @param {*} jsonArray
 */
function namePlateHandler(jsonArray) {
  console.log(jsonArray);
  let items = jsonArray[0].Config.ItemInfo.Item;
  return items;
}
/**
 * 持久化导航数据
 * @param [{Config:{TestUnitInfo:{TestUnit:[{"TestunitId": "","TestUnitName": "","BelongId": "","IsTestNow": "False"}]}},NavigationInfo:{Navigation:[{"Name": "","NavigationId": "1","Description": "","BelongId": "0"}]}}] jsonArray
 */
function navigationHandler(jsonArray) {
  console.log(jsonArray);
  let navTemplate = JSON.stringify({
    label: "",
    children: [],
    originData: {},
    isTestunit: false,
  });

  //初始化根节点
  let root = JSON.parse(navTemplate);
  root.isTestunit = false;

  for (let config of jsonArray) {
    /**
     * 先给每个原始节点加一个children属性
     * 反向遍历每个节点，并判断其父节点，匹配则将其加入父节点
     */

    let tempNavs = [];
    if (
      Object.prototype.toString.call(config.Config.NavigationInfo.Navigation) ==
      "[object Object]"
    ) {
      tempNavs[0]=config.Config.NavigationInfo.Navigation;
    }else{
      tempNavs=config.Config.NavigationInfo.Navigation;
    }
    let tempUnits = config.Config.TestUnitInfo.TestUnit;
    if (!tempUnits.length) {
      tempUnits = [tempUnits];
    }
    let testUnitsOption = [];
    tempUnits.forEach((e, i, a) => {
      testUnitsOption.push({
        label: e.TestUnitName,
        value: e.TestunitId,
      });
    });
    saveJson("temp_data", "testUnitsOption", testUnitsOption);
    let tempNavIncludesUnit = {}; //导航节点及包含监测单元索引
    let tempNavOrigin = {};
    for (let i = tempNavs.length - 1; i >= 0; i--) {
      //反向遍历导航,利用对象引用逐级插入导航和监测单元
      tempNavOrigin[`${tempNavs[i].NavigationId}`] = tempNavs[i]; //记录导航节点原始值
      //原始数据加子节点
      tempNavs[i].children = []; //导航树添加子节点
      tempNavIncludesUnit[`${tempNavs[i].NavigationId}`] = []; //记录导航下监测单元列表
      //遍历监测单元push到节点children,理论上不存在监测单元和导航节点同级，可以根据这个点进行优化
      tempUnits.forEach(function (value, index, arr) {
        if (value.BelongId === tempNavs[i].NavigationId) {
          let tempchild = JSON.parse(navTemplate);
          tempchild.unitId = value.TestunitId;
          tempchild.id = "unit" + value.TestunitId;
          tempchild.label = value.TestUnitName;
          tempchild.isTestNow = value.IsTestNow;
          tempchild.BelongId = value.BelongId;
          tempchild.isTestunit = true;
          // tempchild.originData = value;
          delete tempchild.children;//监测单元无children
          tempNavs[i].children.push(tempchild);
          tempNavIncludesUnit[`${tempNavs[i].NavigationId}`].push(
            value.TestunitId
          ); //列表增加元素
        }
      });

      //遍历导航节点push到节点children
      tempNavs.forEach(function (value, index, arr) {
        if (value.BelongId === tempNavs[i].NavigationId) {//也可改为判断value.NavigationId===tempNavs[i].BelongId  把tempNavs[i]push进arr[index]
          /*tempchild是实际数据在树中的替代节点*/
          //console.log(value)
          let tempchild = JSON.parse(navTemplate);
          tempchild.navId = value.NavigationId;
          tempchild.id = "nav" + value.NavigationId;
          tempchild.label = value.Name;
          tempchild.desc = value.Description;
          tempchild.BelongId = value.BelongId;
          tempchild.isTestunit = false;
          // tempchild.originData = value;
          tempchild.children = value.children;
          tempNavs[i].children.push(tempchild);
        }
      });

      //插入根节点，适配老主控导航配置文件,自己创建根节点
      // if (tempNavs[i].BelongId === "0") {
      //     let tempnav = JSON.parse(navTemplate);
      //     tempnav.id = id;
      //     tempnav.label = tempNavs[i].Name;
      //     tempnav.isTestunit = false;
      //     tempnav.originData = tempNavs[i];
      //     tempnav.children = tempNavs[i].children;
      //     id++;
      //     root.children.push(tempnav);
      // }

      //更新根节点
      if (tempNavs[i].BelongId === "0") {
        root.label = tempNavs[i].Name;
        root.navId = "1";
        root.id = "nav1";
        root.BelongId = "0";
        root.desc = tempNavs[i].Description;
        // root.originData = tempNavs[i];
        //id++;
        root.children = tempNavs[i].children;
      }
    }
    saveJson("temp_data", "NavigationOrigin", tempNavOrigin);
    saveJson("temp_data", "NavIncludesUnit", tempNavIncludesUnit);
  }
  return root;
}
/**
 * 持久化曲线显示
 * @param {*} jsonArray
 */
function curveControlHandler(jsonArray) {
  let curveObj = {};
  for (let index in jsonArray) {
    let curve = jsonArray[index].Config.TestUnitInfo;
    curveObj[`${curve.TestUnitNo}`] = {};
    console.log(curve.CoordinateInfo.Coordinate);
    if (
      Object.prototype.toString.call(curve.CoordinateInfo.Coordinate) ==
      "[object Object]"
    ) {
      curveObj[`${curve.TestUnitNo}`][
        `${curve.CoordinateInfo.Coordinate.mUnit}`
      ] = curve.CoordinateInfo.Coordinate;
    } else {
      if(curve.CoordinateInfo.Coordinate){
      curve.CoordinateInfo.Coordinate.forEach((e, i) => {
        curveObj[`${curve.TestUnitNo}`][`${e.mUnit}`] = e;
      });
    }
    }
  }
  //let curves = jsonArray[0].Config.TestUnitInfo.CoordinateInfo.Coordinate;
  return curveObj;
}

/**
 * 持久化应用软件信息
 * @param {*} jsonArray
 */
function systemInfoHandler(jsonArray) {
  let sysinfo = jsonArray[0].Config.SystemInfo;
  return sysinfo;
}

/**
 * 通用xml转json
 * @param {*} xmls xml数组
 * @param {*} x2js 转换对象
 * @returns
 */
function CommconfigHandlerX2J(xmls, x2js) {
  let jsons = [];
  for (let xml of xmls) {
    x2js.xml = xml;
    x2js.xml2json();
    jsons.push(x2js.json);
  }
  return jsons;
}

/**
 * 通用json转xml
 * @param {*} jsons json数组
 * @param {*} x2js 转换对象
 * @returns
 */
function CommconfigHandlerJ2X(jsons, x2js) {
  let xmls = [];
  for (let json of jsons) {
    x2js.json = json;
    x2js.json2xml();
    xmls.push(x2js.json);
  }
  return xmls;
}

/**
 * 特定xml配置文件操作
 */
function name(params) {
  //x2js.json.Config.TestUnitInfo.TestNow = true;
  //x2js.json.Config.TestUnitInfo.BeginDateTime = new Date().toISOString();
}

module.exports.getConfigFile = getConfigFile;
module.exports.DownloadComponentConfig = DownloadComponentConfig;
module.exports.DownloadAllComponentConfig = DownloadAllComponentConfig;
module.exports.persistenceJSON = persistenceJSON;
module.exports.testHistoryHandler = testHistoryHandler;
module.exports.appInit = appInit;
