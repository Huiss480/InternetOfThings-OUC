window.app = new Vue({
  el: "#app",
  data: function () {
    return {
      // loading: false,
      request: null,
      layer: null,
      isCollapse: false,
      currentNav: "1", //当前选中左侧导航栏
      sideWidth: "15%",
      treeData: [], //导航数据
      tableData: [], //监测单元列表
      tempAddress: {
        //地图选点
        loca: "",
        lat: 0,
        lan: 0,
      },
      // selectValue: null, //选中的开始监测时间
      testUnitHeader: [], //历史数据表头,现在的作用是调控参数选择
      testUnitHistoryData: [
        /*  {
                time: '2022/9/15 16:40:38',
                sensor1: 28.5,
                sensor2: 27.3,
                sensor3: 26.2,
                sensor4: 29,
            } */
      ],
      testRecords: [], //开始监测时间列表
      currentNode: {
        //当前选中节点
        treeid: "",
        id: null,
        name: "根节点",
        desc: "根节点",
        isTestunit: false,
        BelongId: null,
        IsTestNow: "false",
        testTime: "",
        location: " ", //位置文字描述
        crop_name: null,
        current_period_name: null,
        choseLoc: false,
        locaInfo: {
          //位置完全信息
          loca: "",
          lat: 0,
          lng: 0,
        },
        cropInfo: {
          _id: "",
          testunit_id: "",
          crop_name: null,
          crop_id: null,
          predictCircle: "",
          autoPredict: false,
          current_period_id: null,
          current_period_name: null,
        },
      },
      /*     currentPage: 1, // 当前页码
      total: 6, // 总条数
      pageSize: 20, // 每页的数据条数
      historyStatus: "table", //table curve
      historyChartIns: null, */
      sysInfo: {
        SoftwareName: "",
      },
      showBindCrop: false,
      showChoosePeriod: false,
    };
  },
  methods: {
    /* exportCSV(){
      let tableStr='时间,';
      for(let i of this.testUnitHeader){
        tableStr+=i.label+',';
      }
      tableStr+=`
      `;
              for (let i = 0; i < this.testUnitHistoryData.length; i++) {
                tableStr += `${this.testUnitHistoryData[i]['time'] + "	"},`;
                for (const key of this.testUnitHeader) {
                  tableStr += `${this.testUnitHistoryData[i][key.prop] + "	"},`;
                }
                tableStr += `
                `;
              } // encodeURIComponent解决中文乱码
              const uri =
                "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(tableStr); // 通过创建a标签实现
              const link = document.createElement("a");
              link.href = uri; // 对下载的文件命名
              link.download = `${this.currentNode.name}-${this.selectValue}.csv`;
              link.click();
    }, */

    reload() {
      location.reload();
    },
    appReSet() {
      this.$confirm(
        "配置导入前请先在琏雾系统导出配置至平台，否则会造成数据不一致, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(async () => {
          let res = await this.request({
            url: http_apis.comconfig.InitAllComponentConfig.URI,
            method: http_apis.comconfig.InitAllComponentConfig.method,
            params: {},
          });
          if (res.success) {
            location.hash = null;
            location.reload();
          } else {
            this.showMessage("重置失败！", "warning");
          }
        })
        .catch((e) => {
          console.log(e);
          this.showMessage("已取消重置", "info");
        });
    },
    async initSysInfo() {
      //初始化应用软件信息
      let resp = await this.request({
        url: http_apis.comconfig.sysInfo.URI,
        method: http_apis.comconfig.sysInfo.method,
        params: {},
      });
      this.sysInfo = resp.data.SystemInfo;
      window.document.title = this.sysInfo.SoftwareName;
    },
    
    handlerCollapse() {
      //侧边栏
      if (this.isCollapse) {
        this.isCollapse = false;
        this.sideWidth = "15%";
      } else {
        this.isCollapse = true;
        this.sideWidth = "64px";
      }
    },
    showMessage(message) {
      this.$message({
        showClose: true,
        message: message,
        type: "error",
      });
    },
    menuClick(key, keyPath) {
      //切换组件
      this.currentNav = key;
      window.location.hash = this.createHashPath(this.currentNav);
    },
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
    createHashPath(nav, node, primarykey) {
      //生产hash路径
      let hashPath = `#nav=${nav}`;
      if (node) {
        hashPath += `&node=${node}`;
        if (primarykey) {
          hashPath += `&primarykey=${primarykey}`;
        }
      }
      return hashPath;
    },
    async handleNodeClick(data) {
      let nodeData = data;
      console.log(nodeData);
      //请求去重
      if (nodeData.id == this.currentNode.treeid) {
        //选中节点和上次一样，什么都不做，则什么都不执行
        console.log("执行1");
      } else {
        console.log("执行");
        window.location.hash = this.createHashPath(
          this.currentNav,
          nodeData.id
        ); //此语句会激活hash监听

        //重置输入位置信息
        this.tempAddress.loca = "";
        this.tempAddress.lat = 0;
        this.tempAddress.lng = 0;

        let resp;
        if (nodeData.isTestunit) {
          //是监测单元，无desc
          //清空监测单元相关数据
          this.historyStatus = "table";
          this.selectValue = null;
          this.testRecords = [];
          this.testUnitHeader = [];
          this.testUnitHistoryData = [];
          this.currentNode.crop_name = null;
          this.currentNode.current_period_name = null;
          if (this.historyChartIns != null) {
            this.historyChartIns.dispose();
          }

          this.currentNode.treeid = nodeData.id;
          this.currentNode.id = nodeData.unitId;
          this.currentNode.name = nodeData.label;
          this.currentNode.BelongId = nodeData.BelongId;
          this.currentNode.IsTestNow = nodeData.isTestNow;
          this.currentNode.isTestunit = true;
          this.currentNode.choseLoc = true;
         
          //获取监测单元下传感器，生成表头
          let testUnitHeader = await this.request({
            url:
              http_apis.testUnit.singleTestUintTableHeader.URI +
              "/" +
              nodeData.unitId,
            method: http_apis.testUnit.singleTestUintTableHeader.method,
            params: {},
          });
          console.log(testUnitHeader);
          this.testUnitHeader = testUnitHeader.data;

          /*下面两个请求依赖数据组件*/
          //获取选中监测单元监测状态
          let unitStatus = await this.request({
            url: http_apis.testUnit.testUnitStatus.URI,
            method: http_apis.testUnit.testUnitStatus.method,
            params: {
              //ProjectCode: ProjectCode,
              "testUnitIds[]": this.currentNode.id,
            },
          });
          if (unitStatus.code == 20000) {
            this.currentNode.IsTestNow = unitStatus.data.status;
            this.currentNode.testTime = unitStatus.data.testTime;
          } else {
            this.currentNode.IsTestNow = "false";
            this.currentNode.testTime = "";
          }
        
        } else {
          //是导航
          this.currentNode.treeid = nodeData.id;
          this.currentNode.id = nodeData.navId;
          this.currentNode.name = nodeData.label;
          this.currentNode.BelongId = nodeData.BelongId;
          this.currentNode.desc = nodeData.desc;
          this.currentNode.isTestunit = false;
          if (nodeData.children && nodeData.children[0].isTestunit) {
            this.currentNode.choseLoc = true;
            let ids = []; //导航节点下的监测单元号
            //console.log(nodeData.children)
            //获取监测单元ID
            nodeData.children.forEach((e) => {
              //console.log(e)
              ids.push(e.unitId);
            });
          
            this.tableData = nodeData.children;
            /*下面一个请求依赖数据组件*/
            //获取节点下所有监测单元最新状态列表
            let unitStatus = await this.request({
              url: http_apis.testUnit.testUnitStatus.URI,
              method: http_apis.testUnit.testUnitStatus.method,
              params: {
                //ProjectCode: ProjectCode,
                testUnitIds: ids,
              },
            });
            //整合监测单元数据
            if (unitStatus.code == 20000) {
              if (typeof unitStatus.data.status == "string") {
                unitStatus.data = [unitStatus.data];
              }
              nodeData.children.forEach((e, i, a) => {
                //直接修改原数组下的内容
               
                a[i]["isTestNow"] = unitStatus.data[i].status;
              });
            } else {
              nodeData.children.forEach((e, i, a) => {
                //直接修改原数组下的内容
            
                a[i]["isTestNow"] = "false";
              });
            }

            //console.log(nodeData.children)
            // console.log(nodeData.children)
            // nodeData.children.forEach((e) => {
            //     this.tableData.push(e)
            // })
            this.tableData = nodeData.children;
          } else {
            this.currentNode.choseLoc = false;
          }
        }
      }
    },
    
    showMessage(message, type) {
      this.$message({
        message: message,
        type: type, // 'success' 'warning' 'error'
      });
    },
   
    async handleTest(action, row) {
      //开停止监测
         //切换监测状态
         if (action=='start') {
          let metaData = `meta`;
          let res = await this.openTest(Number(row.unitId), metaData);
          if (res) {
            this.showMessage("开始监测成功", "success");
            this.reload()
          } else {
            this.showMessage("开始监测失败,请重试！", "warning");
          }
        } else {
          let res = await this.stopTest(Number(row.unitId));
          if (res) {
            this.showMessage("停止监测成功", "success");
            this.reload()
          } else {
            this.showMessage("停止监测失败,请重试！", "warning");
          }
        }
      console.log("开停止监测", action, row);
    },
    navigateToScene() {
      //跳转数据大屏
      //加路径参数
      let params;
      if (this.currentNode.isTestunit) {
        //是监测单元
        params = `navId=${this.currentNode.BelongId}&testunitId=${this.currentNode.id}`;
      } else {
        params = `navId=${this.currentNode.id}`;
      }
      console.log(params);
      if (window.opened == null || window.opened.closed) {
        window.opened = window.open(`/html/new_scene.html#${params}`, "scene");
        window.opened.location.hash = params;
      } else {
        window.opened.location.hash = `${params}`;

        window.opened.focus();
      }
      // this.dataParams = params;
    },
    /*  handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.currentPage = 1;
      this.pageSize = val;
    },
    //当前页改变时触发 跳转其他页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
    }, */
  },
  mounted: async function () {
    // 将request赋给vue变量
    this.request = window.request;
    this.openTest = window.openTest;
    this.stopTest = window.stopTest;
    //获取token
    window.requestToken(this.request);

    window.appInit();
    /*   let token = null;
    do {
      try {
        token = await window.requestToken(this.request);
        console.log("token", token);
      } catch (e) {
        token = null;
      }
    } while (!token); */

    await this.initSysInfo();

    //调用接口初始化后端所有配置文件

    //树形数据初始化
    let treeDataresp = await this.request({
      url: http_apis.navigation.init.URI,
      method: http_apis.navigation.init.method,
    });
    this.treeData.push(treeDataresp.data);
    //console.log(treeDataresp)

    //判断路径参数，没有路径参数则什么都不做，有路径参数则回显
    this.getHashParams();
    if (window.location.hash == "") {
    } else {
      this.$nextTick(async () => {
        if ("nav" in window.hrefParams) {
          this.currentNav = window.hrefParams.nav;
          if ("node" in window.hrefParams && this.currentNav == "1") {
            //设置当前选中节点
            this.$refs.treeNavself.$refs.treeNav.setCurrentKey(
              window.hrefParams.node
            );
            //获取当前节点数据
            this.handleNodeClick(
              this.$refs.treeNavself.$refs.treeNav.getCurrentNode()
            );
            // if ("primarykey" in window.hrefParams) {
            //   console.log("primarykey?");
            //   this.selectValue = window.hrefParams.primarykey;
            //   await this.queryHistoryData();
            // }
          } else if ("node" in window.hrefParams && this.currentNav == "2-1") {
          }
        }

        //获取测试数据
      });
    }
  },
});
