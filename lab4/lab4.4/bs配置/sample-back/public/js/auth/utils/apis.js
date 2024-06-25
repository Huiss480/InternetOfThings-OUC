const http_apis = {
  //应用软件服务IP端口
  baseURL: "http://127.0.0.1:30001",
  //获取接口授权
  authorization: {
    URI: "/grant/authorization",
    method: "POST",
  },
  //配置文件
  comconfig: {
    //重置所有配置文件
    InitAllComponentConfig: {
      URI: "/comconfig/InitAllComponentConfig",
      method: "GET",
    },
    //初始化数据采集组件mainController
    appInit: {
      URI: "/comconfig/appInit",
      method: "GET",
    },
    //获取某个监测单元的开始监测记录
    unitTestRecords: {
      URI: "/comconfig/unitTestRecords",
      method: "GET",
    },
    //应用软件信息
    sysInfo: {
      URI: "/comconfig/sysInfo",
      method: "GET",
    },
    //监测单元列表
    testUnitsOption: {
      URI: "/comconfig/testUnitsOption",
      method: "GET",
    },
  },
  //监测单元
  testUnit: {
    //获取所有监测单元
    allTestUnits: {
      URI: "/testUnit/allTestUnits",
      method: "GET",
    },
    //获取监测单元监测状态
    testUnitStatus: {
      URI: "/testUnit/testUnitStatus",
      method: "GET",
    },
    //获取监测单元历史数据表头
    singleTestUintTableHeader: {
      URI: "/testUnit/singleTestUintTableHeader",
      method: "GET",
    },
    //获取监测单元视频信息
    singleTestUintVideoinfo: {
      URI: "/testUnit/singleTestUintVideoinfo",
      method: "GET",
    },
    //开始监测
    openTest: {
      URI: "/testUnit/openTest",
      method: "GET",
    },
    //停止监测
    stopTest: {
      URI: "/testUnit/stopTest",
      method: "GET",
    },
  },
  //导航信息
  navigation: {
    //获取导航树
    init: {
      URI: "/navigation/init",
      method: "GET",
    },

  },
  //获取某次监测的历史数据
  datahandler: {
    //获取某次开测历史数据
    historyData: {
      URI: "/datahandler/historyData",
      method: "GET",
    },
    //实时数据
    currentData: {
      URI: "/datahandler/currentData",
      method: "GET",
    },
    //单个传感器实时数据
    currentSensorData: {
      URI: "/datahandler/currentSensorData",
      method: "GET",
    },
  },
  //场景数据
  scene: {
    //获取场景初始化位置参数
    sceneInitInfo: {
      URI: "/scene/sceneInitInfo",
      method: "GET",
    },
    //获取监测单元传感器初始化参数
    sceneTestUnitInitInfo: {
      URI: "/scene/sceneTestUnitInitInfo",
      method: "GET",
    },
  }
};
const mqtt_topics = {
  //mqtt连接信息
  connection_info: {
    host: "192.168.2.3",
    user: "appfront",
    passwd: "ouccs",
  },
  control: {
    topic: "",
    qos: 2,
    payload: {
      msg_id: null,
      type: "controlcmd",
      data: {
        order: null,
        loop: 0,
      },
    },
  },
  video: {
    topic: "/gate_${IoTGateNo}/video/push_stream",
    qos: 2,
    payload: {
      msg_id: null,
      device_info: {
        nvrUserId: "", //nvr⽤户名
        nvrPassword: "", //nvr密码
        nvrIp: "", //nvrIP地址
        nvrType: "", //nvr类型 1代表海康 2代表华为 3 代表⼤华
        device_type: "IPC", //设备类型
        play_type: "REAL", //播放类型
        channel: "", //NVR通道
        stream_type: "flv", //转码类型，默认flv
      },
    },
  },
  dass: {},
};

function generateDassControlTopic(IoTGateNo) {
  return {
    pub: `/gate_${IoTGateNo}/controldass/order`,
    sub: `/gate_${IoTGateNo}/dass/upload_SensorData`,
  };
}
//生成视频推送发布订阅主题
function generateVideoStartTopic(IoTGateNo) {
  return {
    pub: `/gate_${IoTGateNo}/video/push_stream`,
    sub: `/gate_${IoTGateNo}/video/push_stream_reply`,
  };
}
//生成视频停止发布订阅主题
function generateVideoStopTopic(IoTGateNo) {
  return {
    pub: `/gate_${IoTGateNo}/video/stop_stream`,
    sub: `/gate_${IoTGateNo}/video/stop_stream_reply`,
  };
}
