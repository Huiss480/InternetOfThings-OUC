Vue.component('cropmanage', {
    data: function () {
        return {
            showAddCrop: false,
            isUpdate: false,
        }
    },
    methods: {
        showAddDialog(){
            this.isUpdate=false;
            this.showAddCrop=true;
        },
        addSuccess() {
            this.$refs.croptable.loadData();
        },
        onUpdate(cropInfo) {
            this.isUpdate=true;
            this.showAddCrop=true;
            this.$nextTick(()=>{
                this.$refs.updateCrop.modeifyCrop=cropInfo;
                this.$refs.updateCrop.cropForm.cropName=cropInfo.cropName;
                this.$refs.updateCrop.cropForm.crop_model_id=cropInfo.crop_model_id;
                this.$refs.updateCrop.cropForm.cropDesc=cropInfo.cropDesc;
            })
        }    
    },
    template: `<span>  <el-input
    placeholder="请选择监测单元"
    style="width: 200px;margin-right:20px;" >
</el-input><el-button type="primary" @click="submitLoca">筛选</el-button></span>`
})