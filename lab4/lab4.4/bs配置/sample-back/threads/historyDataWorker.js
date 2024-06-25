const {Worker, isMainThread, parentPort, workerData } = require('worker_threads');

function historyDataHandle( primaryKey, result) {
    //截取日期字符串
  let testTime = primaryKey.slice(0, 10) + " " + primaryKey.slice(10, 18); //18 等同于 primaryKey.length - testUnitNo.length
  let date = new Date(testTime).valueOf();
  let dataList = [];
  if (result.data == null) {} else {
    let howlong = result.data.DotHowLong;
    let testData = result.data.TestData;
    for (let i in howlong) {
      //决定生成几条记录，并决定从传感器列表取哪个值
      let obj = {};

      obj.time = new Date(
        date.valueOf() + Math.floor( howlong[i] * 60 * 60 * 1000)
      ).toLocaleString('zh-CN', {hour12: false}); //计算实际时间
      testData.forEach((e) => {
        //每个传感器列表取一个值，howlong和sensordata是一一对应的
        if (e.dotValue[i] == 9999999 || e.dotValue[i] == 8888888) {
          obj[`sensor${e.sensorNo}`] = null;
        } else {
          obj[`sensor${e.sensorNo}`] = e.dotValue[i];
        }
        //obj.sensorNo = e.sensorNo;
        // obj[`${testData[i].sensorNo}`]=${testData[i].sensorNo}
      });
      dataList.push(obj);
    }
  }
  return dataList;
}

if (isMainThread) {
    module.exports.historyDataHandle=historyDataHandle;
   } else {
    parentPort.postMessage( historyDataHandle(workerData.primaryKey,workerData.result));
   }

