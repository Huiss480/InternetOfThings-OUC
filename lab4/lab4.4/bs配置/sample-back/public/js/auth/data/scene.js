// vue组件
let app = new Vue({
  el: "#app",
  data: function () {
    return {
      testTime: '', //开测时间
      showVideoControl: false,
      currentControlType: "V", //当前控制值类型
      currentSensor: "",
      currentControlMax: 100,
      currentControlMin: 0,
      sensorControlDialogShow: false, //参数控制窗口
      currentSensorValue: 0, //当前要修改的控制值
      testUnitLoop: null, //轮询获取最新监测数据
      videoIns: null, //视频实例
      mqttIns: null, //MQTT实例
      videoList: [], //视频设备列表
      sceneParams: {}, //场景初始化参数
      hrefParams: {}, //路径参数
      activeName: "sensor1", //当前曲线名
      lastName: "", //上一个曲线名
      htmlText: {
        //页面文本
        title: "应用名称",
        lt: {
          title: "视频画面",
        },
        lb: {
          title: "实时曲线",
        },
        m: {
          title: "参数控制",
        },
        rt: {
          title: "当前观测",
          name: "名称",
          location: "位置",
          createTime: "创建时间",
        },
        rm: {
          title: "实时数值",
        },
        rb: {
          title: "系统监测",
        },
      },
      currentShow: {
        //当前监测单元信息
        IsTestNow: false,
        desc: "",
        id: "",
        latitude: 0,
        loca: "",
        longtitude: 0,
        title: "",
      },
      sensorDataListIndex: {}, //传感器名和数组索引记录(用来更新曲线时使用，避免重新查询)
      sensorDataList: [
        //监测单元下传感器参数
        /* {
                    img: '/img/温度.png',
                    name: '温度',
                    value: ' ',
                    unit: '℃',
                } */
      ],
      sensorControlUnitListIndex: {}, //控制传感器单位和数组索引记录(一对多关系)
      sensorControlListIndex: {}, //控制传感器名和数组索引记录
      sensorControlList: [],
      charts: {
        // {
        // 	option:{},
        // 	chartDom:{},
        // 	chartIns:{}
        // }
      },
      sysMonitorRecords: [], //操作记录
      sysInfo: {
        SoftwareName: ""
      },
    };
  },
  methods: {
    async pubOrder(PTZ) {
      console.log(PTZ, this.videoList[0]);
      let deviceInfo = this.videoList[0];
      deviceInfo.nvrType = parseInt(deviceInfo.nvrType);
      deviceInfo.channel = parseInt(deviceInfo.channel);
      let pubRes = await this.request({
        url: http_apis.scene.publishVideoOrder.URI,
        method: http_apis.scene.publishVideoOrder.method,
        data: {
          IoTGateNo: deviceInfo.IoTGateNo,
          deviceInfo,
          PTZ,
        },
      });
      0;
      if (pubRes.data) {
        //this.showMessage("成功！", "warning");
      }
    },
    async changeTestUnitStatus() {
      //切换监测状态
      if (!this.currentShow.IsTestNow) {
        let sensorsText = "";
        this.sensorDataList.forEach((e) => {
          sensorsText += `${e.name}(${e.unit}`;
        });
        let metaData = `应用名:${this.htmlText.title}@监测单元:${this.currentShow.title}@参数:${sensorsText}@`;
        let res = await this.openTest(this.currentShow.id, metaData);
        this.addSysMonitorRecord("开始监测...");
        if (res) {
          this.currentShow.IsTestNow = true;
          this.showMessage("开始监测成功", "success");
          //初始化监测单元
          this.testUnitInit();
        } else {
          this.showMessage("开始监测失败,请重试！", "warning");
        }
      } else {
        let res = await this.stopTest(this.currentShow.id);
        this.addSysMonitorRecord("停止监测...");
        if (res) {
          this.showMessage("停止监测成功", "success");
          this.currentShow.IsTestNow = false;
          clearInterval(this.testUnitLoop);
        } else {
          this.showMessage("停止监测失败,请重试！", "warning");
        }
      }
    },
    async updateControlValue() {
      this.addSysMonitorRecord("发送设备控制命令...");
      const loading = this.$loading({
        lock: true,
        text: '请稍候',
        // spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      //调用后端mqtt发送控制命令
      let currentSensoroBJ =
        this.sensorControlList[this.sensorControlListIndex[this.currentSensor]];
      let pubRes = await this.request({
        url: http_apis.scene.publishOrder.URI,
        method: http_apis.scene.publishOrder.method,
        params: { //和后端控制策略字段一致
          IoTGateNo: currentSensoroBJ.IoTGateNo,
          controlType: currentSensoroBJ.controlType,
          instrument_type: currentSensoroBJ.instrumentType,
          instrument_id: currentSensoroBJ.instrumentId,
          controlValue: this.currentSensorValue,
          controlUnit: currentSensoroBJ.originUnit,
          gapMin: this.currentControlMin,
          gapMax: this.currentControlMax
        },
      });
      if (pubRes.data) {
        this.sensorControlList[
          this.sensorControlListIndex[this.currentSensor]
        ].value = this.currentSensorValue;
        this.showMessage("控制命令发送成功", "success");
        this.sensorControlDialogShow = false;

        //更新记录控制值
        let resp = await this.request({
          url: http_apis.scene.updateControlValue.URI,
          method: http_apis.scene.updateControlValue.method,
          data: {
            testUnitNo: this.currentShow.id,
            sensorId: this.currentSensor,
            controlValue: this.currentSensorValue,
          },
        });
      } else {
        this.showMessage("控制命令发送失败", "warning");
      }
      loading.close()
    },
    videoControl() {
      //摄像头控制
      this.showVideoControl = !this.showVideoControl;
    },
    videoInit() {
      //视频组件初始化
      try {
        this.videoIns.stopVideo();
      } catch (e) {}
      if (this.videoList.length > 0) {
        this.addSysMonitorRecord("视频组件初始化...");
        this.mqttIns = addSubscribe(this.mqttIns, this.videoList[0].IoTGateNo);
        this.videoIns = new VideoIns(this.videoList[0]);
        this.videoIns.getVideoUrl(this.mqttIns);
      }
    },
    handleControlClick(sensorItem) {
      this.currentSensor = sensorItem.id;
      this.sensorControlDialogShow = true;
      this.currentControlType = sensorItem.controlType;
      this.currentSensorValue = sensorItem.value;
      this.currentControlMin = parseInt(sensorItem.low);
      this.currentControlMax = parseInt(sensorItem.high);
    },
    //过滤控制显示
    filterControlValue(sensor) {
      if (sensor.controlType == "B") {
        if (sensor.value) {
          return "开";
        } else {
          return "关";
        }
      } else {
        return sensor.value;
        // if (sensor.value > 10)
        // else {
        //   return "关";
        // }
      }
    },
    async initSysInfo() {
      //初始化应用软件信息
      let resp = await this.request({
        url: http_apis.comconfig.sysInfo.URI,
        method: http_apis.comconfig.sysInfo.method,
        params: {},
      });
      this.sysInfo = resp.data.SystemInfo;
      this.htmlText.title = this.sysInfo.SoftwareName;
      window.document.title = this.sysInfo.SoftwareName + "-实时监控";
    },
    //添加系统监控记录
    addSysMonitorRecord(text) {
      this.sysMonitorRecords.unshift(new Date().toLocaleString() + " " + text);
    },
    /**生成曲线参数
     * @param legendData array 图例
     * @param titleData string 标题
     * @param fullId 放大曲线id
     * @param yname 纵坐标名称
     * @param seriesName
     */
    produceChartsOption({
      legendData,
      titleData,
      fullId,
      yname,
      seriesName,
      data,
    }) {
      return {
        dackMode: true,
        legend: {
          //标签
          type: "scroll",
          align: "left",
          data: legendData,
          textStyle: {
            color: "#bcaaaa",
          },
        },
        grid: {
          top: 80,
          right: 80,
        },
        title: {
          text: titleData,
          textStyle: {
            color: "#000",
            fontSize: "12",
          },
        },
        tooltip: {
          trigger: "axis",
          // formatter: function (params) {
          //     params = params[0];
          //     return (
          //         params.name +
          //         ' : ' +
          //         params.value[1]
          //     );
          // },
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#283b56",
            },
          },
        },
        toolbox: {
          show: true,
          orient: "vertical",
          right: 10,
          feature: {
            dataZoom: {
              yAxisIndex: "none",
            },
            dataView: {
              readOnly: true,
            },
            magicType: {
              type: ["line", "bar"],
            },
            restore: {},
            saveAsImage: {},
            myFull: {
              show: true,
              title: "全屏",
              icon: "image://../../img/放大.png",
              onclick: function (e) {
                let opts = e.getOption();
                //循环计时器
                let loop = null;
                opts.toolbox[0].feature.myFull.show = false;
                //window.top表示最顶层iframe  如果在当页面全屏打开 删去window.top即可
                window.top.layer.open({
                  title: false,
                  type: 1,
                  content: `<div id="full${fullId}" style="height:500px;width:700px;padding:30px"></div>`,
                  success: function () {
                    let fullchart = echarts.init(
                      window.top.document.getElementById(`full${fullId}`)
                    );
                    fullchart.setOption(opts);
                    let currentDataResult = null;
                    loop = setInterval(async function () {
                      //获取单传感器实时数据
                      //此处this是window对象
                      currentDataResult = await app.request({
                        url: http_apis.datahandler.currentSensorData.URI,
                        method: http_apis.datahandler.currentSensorData.method,
                        params: {
                          testUnitNo: app.currentShow.id,
                          sensorName: fullId,
                        },
                      });

                      //重绘数据
                      fullchart.setOption({
                        series: [{
                          data: currentDataResult.data.currentSensorData,
                        }, ],
                      });
                    }, 5000);
                  },
                  cancel: function (index, layero) {
                    //清除计时器
                    clearInterval(loop);
                    loop = null;
                  },
                });
              },
            },
          },
        },
        dataZoom: [
          //区域缩放
          {
            //内置型
            type: "inside",
            start: 0,
            end: 100,
          },
          {
            //滑动条型
            start: 0,
            end: 100,
          },
        ],
        xAxis: [{
          name: "时间",
          type: "category", //time有X轴重叠问题
          nameRotate: 10,
          // min: new Date(),
          minInterval: 10 * 1000,
          intreval: 1000,
          splitNumber: 5,
          splitLine: {
            show: false,
          },
          axisLable: {
            show: true,
            hideOverlap: true,
            width: 10,
            overflow: "break",
          },
        }, ],
        yAxis: [{
          type: "value",
          name: yname,

          nameGap: 25,
          boundaryGap: [0, "100%"],
          splitLine: {
            show: false,
          },
        }, ],
        series: [{
          name: seriesName,
          type: "line",
          connectNulls: true,
          showSymbol: false,
          data: data,
          lineStyle: {
            width: 1,
          },
        }, ],
      };
    },
    //初始化曲线
    initChart(id, obj) {
      // obj = {
      //     legendData: ['温度'],
      //     titleData: '测试数据',
      //     fullId: `full${id}`,
      //     yname: '温度',
      //     data: []
      // }
      let option = this.produceChartsOption(obj);
      //console.log(option)
      let chartDom = document.getElementById(id); //this.$refs[`${id}`]; //document.getElementById(id);
      let myChart = echarts.init(chartDom);
      // let tempchart = {
      //     option: option,
      //     chartDom: chartDom,
      //     chartIns: myChart
      // }
      // this.charts[id] = tempchart; //曲线实例放入列表记录
      myChart.setOption(option);
      myChart.resize();
      return myChart;
    },
    handleClick(tab, event) {
      //实时曲线选项卡点击事件  根据实际情况改为判断是否在已渲染列表内
      if (this.activeName == this.lastName) {
        //console.log("不渲染");
      } else {
        //console.log("重新渲染");
        this.lastName = this.activeName;
        this.$nextTick(() => {
          // this.initChart(this.activeName);
          this.charts[this.activeName].resize();
        });
      }
    },
    //单位加图片参数占位函数
    unitAddImg() {},
    //区分控制参数占位函数
    unitSplit() {},
    getHashParams() {
      //获取路径参数
      window.hrefParams = {};
      window.lastHash = window.location.hash;
      if (window.location.hash != "") {
        window.location.hash
          .split("#")[1]
          .split("&")
          .forEach((e, i, a) => {
            let ele = e.split("=");
            window.hrefParams[ele[0]] = ele[1];
          });
      }
      return window.hrefParams;
    },
    createHashPath(navId, testUnitId) {
      //生产hash路径
      let hashPath = `#navId=${navId}`;
      if (testUnitId) {
        hashPath += `&testunitId=${testUnitId}`;
      }
      return hashPath;
    },
    showMessage(message, type) {
      this.$message({
        message: message,
        type: type, // 'success' 'warning' 'error'
      });
    },
    //订阅主题占位函数
    addSubscribe() {},
    async testUnitInit() {
      this.addSysMonitorRecord("监测单元信息初始化...");
      // #region
      if ("testunitId" in window.hrefParams) {
        //观测信息回显
        this.sceneParams.data.list.forEach((e) => {
          if (e.id == window.hrefParams.testunitId) {
            this.currentShow.IsTestNow = e.IsTestNow;
            this.currentShow.desc = e.desc;
            this.currentShow.id = e.id;
            this.currentShow.latitude = e.latitude;
            this.currentShow.loca = e.loca;
            this.currentShow.longtitude = e.longtitude;
            this.currentShow.title = e.title;
          }
        });
        //初始化传感器参数
        this.addSysMonitorRecord("传感数据初始化...");
        //获取监测单元下传感器数据并初始化实时数值以及实时曲线
        //单位，名称 this.params 以及曲线图例 unitToimg.js
        let sceneTestUnitParams = await this.request({
          url: http_apis.scene.sceneTestUnitInitInfo.URI,
          method: http_apis.scene.sceneTestUnitInitInfo.method,
          params: {
            testunitId: window.hrefParams.testunitId + "",
          },
        });
        //视频列表
        this.videoList = sceneTestUnitParams.data.videoList;
        //监测单元下传感器顺序和数据组件返回数据顺序应一一对应
        let tempObj = this.unitSplit(
          this.unitAddImg(sceneTestUnitParams.data.sensorList)
        );
        //监测参数列表
        this.sensorDataList = tempObj.sensorDataList;
        this.sensorDataList.forEach((e, i) => {
          this.sensorDataListIndex[`${e.prop}`] = i;
        });
        this.activeName = this.sensorDataList[0].prop;
        //控制列表
        this.sensorControlList = tempObj.sensorControlList;
        this.sensorControlList.forEach((e, i) => {
          this.sensorControlListIndex[`${e.id}`] = i;
          //单位索引
          if (e.originUnit in this.sensorControlUnitListIndex) {
            this.sensorControlUnitListIndex[`${e.originUnit}`].push(i);
          } else {
            this.sensorControlUnitListIndex[`${e.originUnit}`] = [];
            this.sensorControlUnitListIndex[`${e.originUnit}`].push(i);
          }
        });
        // //根据单位获取控制参数上下限
        // let controlSensorGapRes = await this.request({
        //   url: http_apis.scene.sceneSensorControlGap.URI,
        //   method: http_apis.scene.sceneSensorControlGap.method,
        //   data: {
        //     testUnitNo: this.currentShow.id,
        //     unitList: Object.keys(this.sensorControlUnitListIndex),
        //   },
        // });
        // let controlSensorGap = controlSensorGapRes.data.gapResult;
        // for (let unit in controlSensorGap) {
        //   this.sensorControlUnitListIndex[unit].forEach((e) => {
        //     this.sensorControlList[e].low = controlSensorGap[unit].low;
        //     this.sensorControlList[e].high = controlSensorGap[unit].high;
        //   });
        // }
        // //请求监测单元下控制参数的记录值
        // let controlSensorValueRes = await this.request({
        //   url: http_apis.scene.controlDataValue.URI,
        //   method: http_apis.scene.controlDataValue.method,
        //   data: {
        //     testUnitNo: this.currentShow.id,
        //     sensorList: Object.keys(this.sensorControlListIndex),
        //   },
        // });
        // let controlSensorValue = controlSensorValueRes.data.controlDataResult;
        // for (let sensor in controlSensorValue) {
        //   this.sensorControlList[this.sensorControlListIndex[sensor]].value =
        //     controlSensorValue[sensor];
        // }
        //console.log(tempObj.sensorControlIndex);

        // `this` 指向 vm 实例
        this.$nextTick(async () => {
          //初始化所有曲线
          this.addSysMonitorRecord("曲线组件初始化...");
          this.sensorDataList.forEach((e, i, a) => {
            this.charts[`${e.prop}`] = this.initChart(`${e.prop}`, {
              legendData: [`${e.name}`],
              titleData: `${e.name}实时数据`,
              fullId: `${e.prop}`,
              yname: e.unit,
              seriesName: e.name,
              data: [],
            });
          });
          this.lastName = this.sensorDataList[0].prop;

          //视频初始化
          this.videoInit();

          //获取监测状态并更新到currentShow;
          //停止监测则什么都不做。监测中则获取实时数据
          //获取选中监测单元监测状态
          this.addSysMonitorRecord("监测状态获取...");
          let unitStatus = await this.request({
            url: http_apis.testUnit.testUnitStatus.URI,
            method: http_apis.testUnit.testUnitStatus.method,
            params: {
              //ProjectCode: ProjectCode,
              "testUnitIds[]": this.currentShow.id,
            },
          });
          if (unitStatus.code == 20001) {
            this.currentShow.IsTestNow = false;
          } else {
            this.testTime = unitStatus.data.testTime;
            this.currentShow.IsTestNow =
              unitStatus.data.status == "false" ? false : true;
          }

          if (this.currentShow.IsTestNow) {
            //获取实时数据
            let that = this;
            that.addSysMonitorRecord("获取实时数据...");
            this.testUnitLoop = setInterval(async function () {
              let currentDataResult = await that.request({
                url: http_apis.datahandler.currentData.URI,
                method: http_apis.datahandler.currentData.method,
                params: {
                  testUnitNo: that.currentShow.id,
                  testTime: that.testTime
                },
              });
              //定时更新曲线
              if (
                Object.keys(currentDataResult.data.currentDataResult).length !=
                0
              ) {
                for (let chart in that.charts) {
                  let tempSensorList =
                    currentDataResult.data.currentDataResult[`${chart}`]
                    .dataList;
                  if (tempSensorList.length >= 1) {
                    that.sensorDataList[that.sensorDataListIndex[chart]].value =
                      tempSensorList[tempSensorList.length - 1].value[1];
                    that.charts[`${chart}`].setOption({
                      series: [{
                        data: tempSensorList,
                      }, ],
                    });

                    // that.addSysMonitorRecord("更新实时数据...");
                    // that.charts[`${chart}`].resize()
                  }
                }
              }
            }, 5000);
          } else {
            //什么都不做
          }
        });
      }
      // #endregion
    },
  },
  mounted: async function () {
    //绑定单位加图片参数函数
    this.unitAddImg = window.unitAddImg;
    this.unitSplit = window.unitSplit;
    // 将request赋给vue变量，绑定请求函数
    this.request = window.request;
    this.openTest = window.openTest;
    this.stopTest = window.stopTest;
    window.appInit();
    //获取token
    let token = null;
    do {
      try {
        this.addSysMonitorRecord("接口授权...");
        token = await window.requestToken(this.request);
        console.log("token", token);
      } catch (e) {
        token = null;
      }
    } while (!token);

    this.addSysMonitorRecord("成功授权...");

    await this.initSysInfo();

    //初始化MQTT
    this.addSysMonitorRecord("连接MQTT服务器...");
    this.addSubscribe = window.addSubscribe;
    this.mqttIns = _mqtt(mqtt_topics.connection_info);

    //获取hash路径参数
    this.addSysMonitorRecord("路径参数解析...");
    this.getHashParams();
    this.hrefParams = window.hrefParams;

    //根据路径参数获取navId和testunitId
    //无论有没有unitid，都需要将导航节点及其包含的监测单元所有信息都请求过来。
    //另外判断是否有监测单元ID,有则获取相关数据。（监测中，实时数据。停止监测中，历史数据）
    if ("navId" in window.hrefParams) {
      this.addSysMonitorRecord("场景数据初始化...");
      //获取位置信息并初始化
      let sceneParams = await this.request({
        url: http_apis.scene.sceneInitInfo.URI,
        method: http_apis.scene.sceneInitInfo.method,
        params: {
          navId: window.hrefParams.navId + "",
        },
      });
      this.sceneParams = sceneParams.data.params;
      //初始化监测单元参数
      await this.testUnitInit();
    }

    //
  },
});