function _mqtt(connection_info) {
  let client = null;
  // 初始化前端mqtt服务
  const options = {
    clean: true, // true: 清除会话, false: 保留会话
    connectTimeout: 4000, // 超时时间
    port: 8083,
    reconnectPeriod: 20000,
    // 认证信息
    username: connection_info.user,
    password: connection_info.passwd,
  };

  const connectUrl = `ws://${connection_info.host}:8083/mqtt`;
  console.log("url", connectUrl);

  client = mqtt.connect(connectUrl, options);

  client.on("reconnect", (error) => {
    console.log("reconnecting", error);
    // app.addSysMonitorRecord("消息服务连接失败，正在重连...");
    // layer.msg("消息服务连接失败，正在重连...");
  });

  client.on("error", (error) => {
    console.log("连接失败:", error);
    // app.addSysMonitorRecord("消息服务连接中断...");
    layer.msg("消息服务连接中断");
  });

  client.on("connect", function () {
    layer.closeAll();
    // app.addSysMonitorRecord("消息服务连接成功...");
    console.log("connect to mqtt server success", connectUrl);
  });
  return client;
}

window.addSubscribe = function (client, gateNo) {
  let subscribeTopicList = {};
  subscribeTopicList[`/gate_${gateNo}/video/push_stream_reply`] = {
    qos: 2,
  };
  subscribeTopicList[`/gate_${gateNo}/video/get_devices_reply`] = {
    qos: 2,
  };

  client.subscribe(subscribeTopicList, function (err) {
    if (!err) {
      console.log("subscribe complete, topic list:", subscribeTopicList);
    }
  });
  return client;
};

window.deleteSubscribe = function (client, gateNo) {
  let subscribeTopicList = {};
  subscribeTopicList[`/gate_${gateNo}/video/push_stream_reply`] = {
    qos: 2,
  };
  subscribeTopicList[`/gate_${gateNo}/video/get_devices_reply`] = {
    qos: 2,
  };

  client.unsubscribe(subscribeTopicList, function (err) {
    if (!err) {
      console.log("unsubscribe complete, topic list:", subscribeTopicList);
    }
  });
  return client;
};

function addMessageHandle(client, callback) {
  //清空当前消息处理函数列表
  client._events.message = [];
  //绑定新的消息处理函数
  client.on("message", callback);
  /*  (topic, message) => {
         // 非本机摄像头推流
         let msg_json = JSON.parse(message.toString())
         if (msg_json.msg_id.substring(0, 5) != 'local') {
             console.log('message from topic', topic, ':', message.toString())
             let topic_type = topic.split("/")
             topic_type = topic_type[topic_type.length - 1]
             // if (msg_json.msg_id in messageList)
             if (topic_type == 'push_stream_reply') {
                 if (messageList[msg_json.msg_id].type == 'REAL')
                     HandleMqttMessageFromStartPush(message, messageList[msg_json.msg_id].data, messageList[msg_json.msg_id]._where)
                 else
                     HandleMqttMessageFromStartPush_reply(message, messageList[msg_json.msg_id].data)
             }
         }
     } */
  return client;
}
