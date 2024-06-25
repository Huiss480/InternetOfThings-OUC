const historyWorker=require("../threads/historyDataWorker.js");
const {Worker } = require('worker_threads');
function getHistortDataByPrimaryKey(ctx, primaryKey) {
  ctx.log4js.logInfo("---查询监测单元一次开测历史数据---");
  return ctx._request({
    url: ctx.apis.receiveHistoryData.URI,
    method: ctx.apis.receiveHistoryData.method,
    params: {
      primaryKey: primaryKey,
    },
  });
}

function historyDataHandler(ctx, primaryKey, result) {
  //截取监测单元号
  // let testUnitNo = primaryKey.slice(18); //由于监测单元号长度不固定，所以将18位日期截去便是监测单元号
  // //根据监测单元号去查询监测单元信息,并生成历史数据表头
  // let testUnits = ctx.getJson('temp_data', 'TestUnits');
  // let tempUnit, headerLsit = [];
  // if (testUnitNo in testUnits) {
  //     tempUnit = testUnits[testUnitNo];

  //     for (let item of tempUnit.SensorInfo) {
  //         let headerItem = {};
  //         headerItem.prop = item.SensorNo;
  //         headerItem.label = item.Name;
  //         headerLsit.push(headerItem);
  //     }
  // }
  ctx.log4js.logInfo("---处理历史数据---");
  return new Promise((resolve,reject)=>{
//单线程处理
  // let dataList= historyWorker.historyDataHandle(primaryKey,result);
  // resolve({dataList});
//子线程处理
const historyWorker = new Worker(ctx._path.join(__dirname,"../threads/historyDataWorker.js"), {workerData: {primaryKey,result}});
let dataList=[];
historyWorker.once('message', (result) => {
 dataList=result;
 resolve({dataList});
 })
    
  })
 
}

//获取最新数据
function getCurrentDataByTestUnitNo(ctx, testUnitNo,limit=500) {
  ctx.log4js.logInfo("---查询监测单元最新数据---");
  return ctx._request({
    url: ctx.apis.receiveData.URI,
    method: ctx.apis.receiveData.method,
    params: {
      testUnitNo: testUnitNo,
      limit:limit
    },
  });
}

//处理监测单元最新数据
function currentDataHandler(ctx, result) {
  ctx.log4js.logInfo("---处理监测单元最新数据---");
  let currentDataResult = {};
  try {
    // let primaryKey =ctx.request.query.testTime.replace(' ','')+ctx.request.query.testUnitNo; //result.data.PrimaryKey;
    //  console.log(primaryKey)
    // //截取日期字符串
    // let testTime = primaryKey.slice(0, 10) + " " + primaryKey.slice(10, 18); //18 等同于 primaryKey.length - testUnitNo.length
    //  console.log(testTime)
    let date = new Date(ctx.request.query.testTime).valueOf();
     console.log(date)
    //所有距开测小时
    let howlong = result.data.DotHowLong.slice(result.data.DotHowLong.length-100);
    //所有测试数据
    let testData = result.data.TestData;
    // console.log(testData)
    //先将时间处理一边，避免重复计算
    let tempTime = [];
    for (let i in howlong) {
      tempTime.push(
        new Date(date.valueOf() + Math.floor( howlong[i] * 60 * 60 * 1000)).toLocaleString('zh-CN', {hour12: false})
      ); //计算实际时间
    }
// console.log(tempTime)
    for (let sensorList of testData) {
      currentDataResult[`sensor${sensorList.sensorNo}`] = {
        dataList: [],
      };
      sensorList.dotValue=sensorList.dotValue.slice(result.data.DotHowLong.length-100)
      for (let i in howlong) {
        //决定生成几条记录，并决定从传感器列表取哪个值
        let obj = {};
        obj.time = tempTime[i];
        if (sensorList.dotValue[i] == 9999999 || sensorList.dotValue[i] == 8888888) {
          obj.value = [tempTime[i], null];
        } else {
          obj.value = [tempTime[i], sensorList.dotValue[i]];
        }
        currentDataResult[`sensor${sensorList.sensorNo}`].dataList.push(obj);
      }
    }
  } catch {
    currentDataResult = {};
  }

  return {
    currentDataResult,
  };
}

//处理监测单元下某一传感器数据
function currentSensorDataHandler(ctx, result) {
  let currentSensorData = [];
  try {
    let primaryKey = ctx.request.query.testTime.replace(' ','')+ctx.request.query.testUnitNo; //result.data.PrimaryKey;
    let sensorName = ctx.request.query.sensorName;
    ctx.log4js.logInfo(`---处理${sensorName}传感器最新数据---`);
    //截取日期字符串
    let testTime = primaryKey.slice(0, 10) + " " + primaryKey.slice(10, 18); //18 等同于 primaryKey.length - testUnitNo.length
    let date = new Date(testTime).valueOf();
    //所有距开测小时
    let howlong = result.data.DotHowLong;
    //所有测试数据
    let testData = result.data.TestData;
    //先将时间处理一边，避免重复计算
    let tempTime = [];
    for (let i in howlong) {
      tempTime.push(
        new Date(date.valueOf() + Math.floor( howlong[i] * 60 * 60 * 1000)).toLocaleString('zh-CN', {hour12: false})
      ); //计算实际时间
    }
    for (let sensorList of testData) {
      if (`sensor${sensorList.sensorNo}` == sensorName) {
        for (let i in howlong) {
          //决定生成几条记录，并决定从传感器列表取哪个值
          let obj = {};
          obj.time = tempTime[i];
          if (sensorList.dotValue[i] == 9999999 || sensorList.dotValue[i] == 8888888) {
            obj.value = [tempTime[i], null];
          } else {
            obj.value = [tempTime[i], sensorList.dotValue[i]];
          }
          currentSensorData.push(obj);
        }
      }
    }
  } catch {
    currentSensorData = [];
  }

  return {
    currentSensorData,
  };
}

module.exports.getHistortDataByPrimaryKey = getHistortDataByPrimaryKey;
module.exports.historyDataHandler = historyDataHandler;
module.exports.getCurrentDataByTestUnitNo = getCurrentDataByTestUnitNo;
module.exports.currentDataHandler = currentDataHandler;
module.exports.currentSensorDataHandler = currentSensorDataHandler;