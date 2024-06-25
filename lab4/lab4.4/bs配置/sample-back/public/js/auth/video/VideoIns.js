function VideoIns(data) {
  this.params = data;
  this.params.nvrType = parseInt(this.params.nvrType);
  this.params.channel = parseInt(this.params.channel);
  this.videoIns = null;
  this.videoUrl = {
    http: null,
    rtmp: null,
  };
  this.videoStatus = false;
}
VideoIns.prototype.addTime=function(starttime,endtime){
  this.params.playStartTime = starttime;
  this.params.playEndTime = endtime;
}

VideoIns.prototype.getVideoUrl = function (mqttClient) {
  let _topic = generateVideoStartTopic(this.params.IoTGateNo);
  let msgId = sha256_digest(new Date().toUTCString());
  mqttClient.publish(
    _topic.pub,
    JSON.stringify({
      msg_id: msgId,
      device_info: this.params,
    }),
    function (err) {
      if (err != undefined) {
        console.error(`publish message to ${_topic.pub} fail`);
      } else {
        console.log(`publish message to ${_topic.pub} success`);
        // messageList[msgId] = {
        //     reply: false,
        //     device_info: cameraData.device_info
        // }
      }
    }
  );
  addMessageHandle(mqttClient, (topic, message) => {
    console.log("消息处理", msgId);
    let res = JSON.parse(message.toString());
    if (topic == _topic.sub) {
      // console.log(res);
      if (res.msg_id == msgId) {
        console.log("返回消息", res);
        if (res.result.status == true) {
          this.videoUrl = res.result.data;
          this.startVideo("_video");
        } else {
          // app.showMessage("视频流不可用！", "warning");
        }
      }
    }
    // mqttClient.end();
  });
};

VideoIns.prototype.startVideo = function (domid) {
  let tempDom = document.getElementById(domid);
  let cameraFlvPlayer = null;
  if (tempDom) {
    cameraFlvPlayer = flvjs.createPlayer({
      type: "flv",
      isLive: true,
      url: this.videoUrl.http,
      cors: true,
      enableWorker: true,
      enableStashBuffer: false,
      stashInitialSize: 128,
      autoCleanupSourceBuffer: true,
    });
    cameraFlvPlayer.attachMediaElement(tempDom);
    try {
      cameraFlvPlayer.load();
      cameraFlvPlayer.play();
      this.videoIns = cameraFlvPlayer;
      app.videoIns = this;
      // console.log(app);
      // cameraFlvPlayer.on(flvjs.Events.ERROR, (e) => {
      //     console.log(e)
      //     this.stopVideo(cameraData);
      //     cameraFlvPlayer.pause();
      //     cameraFlvPlayer.unload();
      //     cameraFlvPlayer.detachMediaElement();
      //     cameraFlvPlayer.destroy();
      //     cameraFlvPlayer = null;
      //     layer.open({
      //         title: '注意！',
      //         content: '视频流异常！',
      //         btn: ['确认'],
      //         yes: function (index) {
      //             stopCamera(cameraData);
      //             layer.close(index);
      //         },
      //         cancel: function (index) {
      //             stopCamera(cameraData);
      //             layer.close(index);
      //         }
      //     })
      // })
    } catch (error) {
      console.log(error);
      this.stopVideo();
    }
  }
};
VideoIns.prototype.stopPush = function (mqttClient) {
  let _topic = generateVideoStopTopic(this.params.IoTGateNo);
  let msgId = sha256_digest(new Date().toUTCString());
  mqttClient.publish(
    _topic.pub,
    JSON.stringify({
      msg_id: msgId,
      device_info: this.params,
    }),
    function (err) {
      if (err != undefined) {
        console.error(`publish message to ${_topic.pub} fail`);
      } else {
        console.log(`publish message to ${_topic.pub} success`);
      }
    }
  );
};
VideoIns.prototype.stopVideo = function () {
  try {
    console.log("video stop");
    this.videoIns.pause();
    this.videoIns.unload();
    this.videoIns.detachMediaElement();
    this.videoIns.destroy();
    this.videoIns = null;
  } catch (error) {
    console.log(error);
  }
};
