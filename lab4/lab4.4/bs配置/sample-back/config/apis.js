/**
 * 数据组件地址及接口
 */
const http_apis = {
  //数据组件BSmain入口地址
  baseURL: "http://192.168.2.3:8881/", //'http://192.168.1.130:8881/', //'http://10.10.10.6:8881/',
  //初始化数据组件
  MainController: {
    URI: "/MainController",
    method: "GET",
  },
  //获取数据组件comconfigIP地址和端口，并设置projectCode
  getConfigFile: {
    URI: "/getConfigFile",
    method: "GET",
  },
  //获取监测单元状态
  getTestUnitStatus: {
    URI: "/getTestUnitStatus",
    method: "GET",
  },
  //获取监测单元changeFlag
  DownloadLatestFlagChage: {
    URI: "/DownloadLatestFlagChage",
    method: "GET",
  },
  //上传配置文件接口
  UploadComponentConfig: {
    URI: "/UploadComponentConfig",
    method: "GET",
  },
  //获取projectcode下某个数据组件的所有的历史配置文件
  DownloadAllComponentConfig: {
    URI: "/DownloadAllComponentConfig",
    method: "GET",
  },
  //获取projectcode下某个数据组件的所有最新的配置文件
  DownloadComponentConfig: {
    URI: "/DownloadComponentConfig",
    method: "GET",
  },
  //获取某次监测的历史数据
  receiveHistoryData: {
    URI: "/receiveHistoryData",
    method: "GET",
  },
  //获取正在监测的最新数据
  receiveData: {
    URI: "/receiveData",
    method: "GET",
  },
  //获取正在监测的最新Limit条数据
  receiveDataLimit: {
    URI: "/receiveDataLimit",
    method: "GET",
  },
  //判断是否初始化
  receiveDataObject: {
    URI: "/receiveDataObject",
    method: "GET",
  },
  //开测
  openTest: {
    URI: "/openTest",
    method: "POST",
  },
  //发命令
  publish: {
    URI: "/publish",
    method: "GET",
  },
  //停测
  stopTest: {
    URI: "/stopTest",
    method: "POST",
  },
};
// const OSapi = {
//   baseURL: "http://127.0.0.1:8888",
//   receiveMetadata: {
//     URI: "/interconnection_node/metaData/receiveMetadata",
//     method: "POST",
//   },
// };
//琏雾系统MQTT服务
const mqtt_topics = {
  host: "mqtt://192.168.2.3:1883",
};
module.exports.http_apis = http_apis;
module.exports.mqtt_topics = mqtt_topics;
// module.exports.OSapi = OSapi;
