Vue.component('navigation', {
    data: function () {
        return {
            defaultProps: {
                children: 'children',
                label: 'label'
            }
        }
    },
    props: ['treeData'],
    template: `
    <el-tree :data="treeData"  :props="defaultProps" ref="treeNav" highlight-current node-key="id" @node-click="$emit('node-click',$event)"  @current-change="$emit('current-change',$event)" :expand-on-click-node="false" default-expand-all :default-expanded-keys="['nav1']">
        </el-tree>
    `
})