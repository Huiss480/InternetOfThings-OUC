Vue.component("cameradialog", {
  data: function () {
    return {};
  },
  methods: {
    handleHover(PTZ) {
      this.$emit("onvideocontrol", PTZ);
    },
  },
  props: ["showVideoControl"],
  template: `
    <el-popover placement="top" width="500px"  trigger="manual" title="摄像头控制" v-model="showVideoControl">
        <div class="all-container">
            <div class="icon-left-container">
                <p style="font-size: 15px;">方向控制</p>
                <div class="top">
                    <i class="el-icon-top-left my-icon" @click="handleHover('LEFT_UP')"
                        ></i>
                    <i class="el-icon-top my-icon" @click="handleHover('UP')" ></i>
                    <i class="el-icon-top-right my-icon" @click="handleHover('RIGHT_UP')"
                        ></i>
                </div>
                <div class="center">
                    <i class="el-icon-back my-icon" @click="handleHover('LEFT')" ></i>
                    <i class="el-icon-s-help my-icon" ></i>
                    <i class="el-icon-right my-icon" @click="handleHover('RIGHT')" ></i>
                </div>
                <div class="bottom">
                    <i class="el-icon-bottom-left my-icon" @click="handleHover('LEFT_DOWN')"
                        ></i>
                    <i class="el-icon-bottom my-icon" @click="handleHover('DOWN')" ></i>
                    <i class="el-icon-bottom-right my-icon" @click="handleHover('RIGHT_DOWN')"
                        ></i>
                </div>
            </div>
            <div class="icon-right-container">
                <p style="font-size: 15px">变倍</p>
                <div class="top">
                    <i class="el-icon-circle-plus my-icon" @click="handleHover('ZOOM_IN')"
                        ></i>
                    <i class="el-icon-remove my-icon" @click="handleHover('ZOOM_OUT')"
                        ></i>
                </div>
                <p style="font-size: 15px">变焦</p>
                <div class="bottom">
                    <i class="el-icon-circle-plus-outline my-icon" @click="handleHover('FOCUS_IN')"
                        ></i>
                    <i class="el-icon-remove-outline my-icon" @click="handleHover('FOCUS_OUT')"
                        ></i>
                </div>
            </div>
        </div>
    </el-popover>
`,
});
