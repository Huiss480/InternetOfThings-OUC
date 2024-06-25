const router = require('koa-router')()
const path = require('path')
const swaggerJSDoc = require('swagger-jsdoc') //引入swagger-jsdoc

router.prefix('/swagger') //设置路由，与app.js中的路由配置保持一致
const swaggerDefinition = {
    info: {
        title: '接口文档', //文档标题
        version: 'v1', //版本号
        host: 'localhost:3000', //服务器地址 http://127.0.0.1:30001/swagger/index.html
        basePath: '/', //访问地址.
    }
}
const options = {
    swaggerDefinition,
    //写有注解的router的存放地址, 最好使用path.join(),这里使用物理路径
    apis: [
        // path.join(__dirname, "./*.js"),
        path.join(__dirname, "../routes/*.js"),
        path.join(__dirname, "../routes/agri_routes/*.js"),
    ]
}
const swaggerSpec = swaggerJSDoc(options)

// 通过路由获取生成的注解文件
router.get('/swagger.json', async function (ctx) {
    ctx.set('Content-Type', 'application/json')
    ctx.body = swaggerSpec
})
module.exports = router