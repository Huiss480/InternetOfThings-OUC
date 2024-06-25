Vue.component('page-header', {
    data: function () {
        return {}
    },
    props: ['title'],
    template: `
    <div
    style="border-left: 5px green solid;
     width: 97% ;
     height: 50px; 
     line-height: 50px; 
     font-size: large; 
     margin-bottom: 20px;
     padding-left: 10px;
     background-color:white;
      font-family: Microsoft YaHei;">
    {{title}}
</div>
    `
})