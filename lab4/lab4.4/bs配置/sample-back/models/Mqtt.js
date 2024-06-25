const mqtt = require("mqtt");
//const mqtt1 = require('async-mqtt');

function Mqtt({
  connectUrl = "mqtt://192.168.0.194:1883",
  options = {
    clean: true, // true: 清除会话, false: 保留会话
    connectTimeout: 4000, // 超时时间
    reconnectPeriod: 4000,
    // 认证信息
    username: "appfrontback",
    password: "ouccs",
  },
}) {
  this.initOK = false;
  this.mqtt = mqtt; //mqtt类
  if (connectUrl) {
    this.connectUrl = connectUrl;
  } else {
    throw new Error("connectUrl为必须参数!");
  }
  if (options) {
    this.options = options;
  } else {
    throw new Error("options为必须参数!");
  }
  this.initOK = true;
  this.client = null; //mqtt实例
  this.connected = false;
  this.connect();
}

Mqtt.prototype.connect = function () {
  if (this.initOK) {
    if (this.client != null) {
      this.client.end(true);
      this.client = null;
      this.client = this.mqtt.connect(this.connectUrl, this.options);
    } else {
      this.client = this.mqtt.connect(this.connectUrl, this.options);
    }
    let that = this;
    this.client.on("connect", function () {
      that.connected = true;
    });
    this.client.on("disconnect", function () {
      that.connected = false;
    });
    this.client.on("error", (error) => {
      that.connected = false;
    });
  } else {
    throw new Error("Mqtt未成功初始化!");
  }
};

// client.subscribe('/gate_1', function (err) {
//     if (!err) {
//         client.publish('/gate_2', 'Hello mqtt')
//     }
// })
// client.on('reconnect', (error) => {
//     console.log('正在重连:', error)
// })

// client.on('error', (error) => {
//     console.log('连接失败:', error)
// })

// client.on('message', (topic, message) => {
//     console.log('收到消息：', topic, message.toString())
// })

//let insmqtt = new Mqtt({ connectUrl, options });
module.exports = Mqtt;
