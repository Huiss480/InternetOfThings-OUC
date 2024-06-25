Vue.component("historydata", {
  data: function () {
    return {
      testUnits: [],
      loading: false,
      selectValue: null, //选中的开始监测时间
      selectUnit: null,//选中的监测单元号
      testUnitName:null,
      showPlayBack:false,
      testUnitHeader: [], //历史数据表头
      testUnitVideoInfo:[],//视频设备信息
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
      currentPage: 1, // 当前页码
      total: 6, // 总条数
      pageSize: 20, // 每页的数据条数
      historyStatus: "table", //table curve
      historyChartIns: null,
    };
  },
  methods: {
    showPlayBackDialog(){
this.testUnitName=this.$refs['unitSelect'].selectedLabel;
this.showPlayBack=true;
    },
    async loadTestUnitsOption() {
      let testUnitsOption = await window.request({
        url: http_apis.comconfig.testUnitsOption.URI,
        method: http_apis.comconfig.testUnitsOption.method,
        data: {},
      });
      this.testUnits = testUnitsOption.data;
    },
    async unitChange(value) {
      this.testUnitName=this.$refs['unitSelect'].selectedLabel;
      window.location.hash = this.createHashPath(window.hrefParams.nav, value);
      this.selectValue=null;
      this.testUnitHistoryData=[]
      //获取监测单元下传感器，生成表头
      let testUnitHeader = await window.request({
        url: http_apis.testUnit.singleTestUintTableHeader.URI + "/" + value,
        method: http_apis.testUnit.singleTestUintTableHeader.method,
        params: {},
      });
      this.testUnitHeader = testUnitHeader.data;
      //获取监测单元下视频数据
      let testUnitVideoInfo = await window.request({
        url: http_apis.testUnit.singleTestUintVideoinfo.URI + "/" + value,
        method: http_apis.testUnit.singleTestUintVideoinfo.method,
        params: {},
      });
      this.testUnitVideoInfo = testUnitVideoInfo.data;
    },
    exportCSV() {
      this.testUnitName=this.$refs['unitSelect'].selectedLabel;
      let tableStr = "时间,";
      for (let i of this.testUnitHeader) {
        tableStr += i.label + ",";
      }
      tableStr += `
            `;
      for (let i = 0; i < this.testUnitHistoryData.length; i++) {
        tableStr += `${this.testUnitHistoryData[i]["time"] + "	"},`;
        for (const key of this.testUnitHeader) {
          tableStr += `${this.testUnitHistoryData[i][key.prop] + "	"},`;
        }
        //换行
        tableStr += `
                      `;
      } // encodeURIComponent解决中文乱码
      const uri =
        "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(tableStr); // 通过创建a标签实现
      const link = document.createElement("a");
      link.href = uri; // 对下载的文件命名
      link.download = `${this.testUnitName}-${this.selectValue}.csv`;
      link.click();
    },
    async reGetTestRecord(change) {
      //重新获取开测记录

      if (change) {
        if (this.selectUnit) {
          let testRecords = await window.request({
            url: http_apis.comconfig.unitTestRecords.URI,
            method: http_apis.comconfig.unitTestRecords.method,
            params: {
              //ProjectCode: ProjectCode,
              ComponentName: "DataComm",
              testUnitId: this.selectUnit,
            },
          });
          this.testRecords = testRecords.data;
        } else {
          this.showMessage("请先选择监测单元", "warning");
        }
      }
    },
    handleHistoryChange(e) {
      //数图切换
      //切换为${e}显示
      this.historyStatus = e;
      if (e == "curve") {
        this.$nextTick(() => {
          let curveLegend = this.testUnitHeader.map((e, i, a) => {
            //console.log(e.prop);
            return e.prop;
          });
          curveLegend.unshift("time");
          let option = {
            legend: {},
            tooltip: {},
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
              },
            },
            dataset: {
              // 用 dimensions 指定了维度的顺序。直角坐标系中，如果 X 轴 type 为 category，
              // 默认把第一个维度映射到 X 轴上，后面维度映射到 Y 轴上。
              // 如果不指定 dimensions，也可以通过指定 series.encode
              // 完成映射，参见后文。
              dimensions: curveLegend,
              source: this.testUnitHistoryData,
            },
            xAxis: {
              type: "category",
            },
            yAxis: {},
            series: this.testUnitHeader.map((e, i, a) => {
              //console.log(e)
              return {
                name: `${e.label}(${e.unit})`,
                type: "line",
                connectNulls: true,
                smooth: 0.6,
                showSymbol: false,
                lineStyle: {
                  width: 1,
                },
              };
            }),
            dataZoom: [
              //区域缩放
              {
                //内置型
                type: "inside",
                start: 90,
                end: 100,
              },
              {
                //滑动条型
                start: 90,
                end: 100,
              },
            ],
            tooltip: {
              trigger: "axis",
              axisPointer: {
                type: "cross",
                label: {
                  backgroundColor: "#283b56",
                },
              },
            },
          };
          let chartDom = document.getElementById("historyData"); //this.$refs[`${id}`]; //document.getElementById(id);
          this.historyChartIns = echarts.init(chartDom);
          this.historyChartIns.setOption(option);
          this.historyChartIns.resize();
        });
      }
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
    async queryHistoryData() {
      this.loading = true;
      //筛选历史数据
      if (this.selectValue != null) {
        console.log("历史数据");
        this.getHashParams();
        window.location.hash = this.createHashPath(
          window.hrefParams.nav,
          window.hrefParams.node,
          this.selectValue
        );
        let unitStatus = await window.request({
          url: http_apis.testUnit.testUnitStatus.URI,
          method: http_apis.testUnit.testUnitStatus.method,
          params: {
            //ProjectCode: ProjectCode,
            "testUnitIds[]": this.selectUnit,
          },
        });
        if (unitStatus.code == 20000) {
          let primaryKey =
            unitStatus.data.testTime.replace(" ", "") + this.selectUnit;
          let historyData = await window.request({
            url: http_apis.datahandler.historyData.URI,
            method: http_apis.datahandler.historyData.method,
            params: {
              primaryKey: this.selectValue,
              testNow: primaryKey == this.selectValue ? true : false,
            },
          });
          this.testUnitHistoryData = historyData.data.dataList; //渲染表格
        }
      } else {
        this.showMessage("请先选择开始监测时间", "warning");
      }
      this.loading = false;
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.currentPage = 1;
      this.pageSize = val;
    },
    //当前页改变时触发 跳转其他页
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.currentPage = val;
    },
    showMessage(message, type) {
      this.$message({
        message: message,
        type: type, // 'success' 'warning' 'error'
      });
    },
  },
  async mounted() {
    this.loadTestUnitsOption();
    this.getHashParams();
    if (window.location.hash == "") {
    } else {
      this.$nextTick(async () => {
        if ("nav" in window.hrefParams) {
          //this.currentNav = window.hrefParams.nav;
          if ("node" in window.hrefParams) {
            this.selectUnit = window.hrefParams.node;
            this.unitChange(this.selectUnit);
            this.reGetTestRecord(true);
            if ("primarykey" in window.hrefParams) {
              console.log("primarykey?");
              this.selectValue = window.hrefParams.primarykey;
              await this.queryHistoryData();
            }
          }
        }
      });
    }
  },
  props: [],
  template: `<div >
        <div style="width: 98%;display:flex;justify-content:space-between;align-items: center;text-align: center; height: 40px; line-height: 30px;  font-family: Microsoft YaHei;font-weight: bolder; background-color:white">
        <span style="margin-left:150px;">  </span>
  
  
        <span >历史监测数据{{historyStatus=='table'?'列表':'曲线'}}</span>
            <span style="margin-right:150px;">
          
            </span>

            
        </div>
        
  
        <!-- 历史数据表 -->
        <div
            style="text-align: left; height: 50px; line-height: 50px;  display: flex;justify-content: space-between;width: 98%;background-color:white;">
            <span><el-select ref='unitSelect' v-model="selectUnit" placeholder="请选择监测单元"
            style="width: 200px;margin-left:10px" @change='unitChange'>
           <el-option v-for="item in testUnits" :key="item.value"
               :label="item.label" :value="item.value">
           </el-option>
       </el-select></span>
            <span>
                <el-button icon="el-icon-s-data" title="切换为曲线显示"
                    v-show="historyStatus=='table'&&selectUnit!=null"
                    @click="handleHistoryChange('curve')"></el-button>
                <el-button icon="el-icon-s-order" title="切换为列表显示"
                    v-show="historyStatus=='curve'&&selectUnit!=null"
                    @click="handleHistoryChange('table')"></el-button>
                    <el-button icon="el-icon-download" title="导出csv"
                    @click="exportCSV" v-show="testUnitHistoryData.length>0"></el-button>
            </span>
            <!-- 分页组件 -->
            <span style="margin-top: 10px; width: 350px;">
                <el-pagination align='center' @size-change="handleSizeChange"
                    :pager-count="5" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-sizes="[10,50,100,200]"
                    :page-size="pageSize" layout="total, prev, pager, next"
                    :total="testUnitHistoryData.length"
                    v-show="historyStatus=='table'">
                </el-pagination>

            </span>
            <!-- 筛选时间 -->
            <span style="margin-right: 20px; font-size: 14px;">
                时间筛选： <el-select v-model="selectValue" placeholder="请选择开始监测时间"
                    @visible-change="reGetTestRecord" style="width: 200px;">
                    <el-option v-for="item in testRecords" :key="item.value"
                        :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
                <el-button type="primary" @click="queryHistoryData"
                    ref="queryHistoryBtn">筛选
                </el-button>
            </span>
        </div>
        <!-- 历史表格 -->
        <el-table height="600" fixed v-show="historyStatus=='table'"
            v-loading="loading"
            :data="testUnitHistoryData.slice((currentPage-1)*pageSize,currentPage*pageSize)"
            style="width: 98%;padding:20px 20px 0 20px" :border="true">
            <el-table-column prop="time" label="监测时间" width="400">
            </el-table-column>
            <template v-for="item in testUnitHeader">
                <el-table-column :prop="item.prop"
                    :label="item.label+'('+item.unit+')'">
                </el-table-column>
            </template>
        </el-table>
        <!-- 历史曲线 -->
        <div id="historyData" class="historyData" ref="historyData"
            style="width: 98%;height: 600px;background-color:white;" v-show="historyStatus=='curve'">
        </div>
        <!-- 历史视频 -->
        <playback ref="playback" :show-play-back="showPlayBack" :testunit-name="testUnitName" :video-info="testUnitVideoInfo[0]" v-if="showPlayBack" @close="showPlayBack=false"></playback>
        </div>

      `,
});
