const Koa = require("koa");
const app = new Koa();
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const {
  koaSwagger
} = require("./public/swagger-ui"); //require('koa2-swagger-ui');
const koajwt = require("koa-jwt");
const cors = require("koa2-cors");
const path = require("path");
const Emitter = require('events').EventEmitter;
const {Worker}=require("worker_threads");


//自定义模块
const clearDir = require("./utils/clearDir.js");
const Mqtt = require("./models/Mqtt");
const ResultBody = require("./models/ResultBody.js");
const _request = require("./utils/request-filter.js"); //和KOA内变量冲突，进行重命名
const apis = require("./config/apis.js").http_apis;
const topics = require("./config/apis.js").mqtt_topics;
// const OSapi=require("./config/apis.js").OSapi;
const X2js = require("./utils/jsonxml.js");
const groupBy = require("./utils/group.js").groupBy;
const log4js = require("./logger/log4js");
const saveJson = require("./data_source/source_init.js").saveJson;
const getJson = require("./data_source/source_init.js").getJson;
const getJsonTemp = require("./data_source/source_init.js").getJsonTemp;


//引入路由
const users = require("./routes/users");
const comconfig = require("./routes/comconfig");
const testunit = require("./routes/testunit");
const navigation = require("./routes/navigation");
const scene = require("./routes/scene");
const datahandler = require("./routes/datahandler");


const eventListener = new Emitter();
//生产环境将下面这行注释
const swagger = require("./config/swagger");



// error handler
onerror(app);

/**
 * 初始化所有配置文件为json
 * 清空/data_source/temp_data
 * 重新加载所有数据
 */
//clearDir(path.join(__dirname, './data_source/temp_data'));
//sourceInit('')

/**
 * 全局对象 ，上下文对象
 */
globalThis.agriApp = {
  cropList:[],//记录被依赖的作物
  eventListener:null,
  log4js: null,
  getJson: null,
  Mqtt: null,
  _request:null,
  apis:null,
  request: {
    body: {},
    query: {}
  }
};
globalThis.agriApp.eventListener=app.context.eventListener = eventListener;
app.context.ResultBody = ResultBody;
app.context._path = path;
globalThis.agriApp._request=app.context._request = _request; //和koa内request冲突，进行重命名
globalThis.agriApp.apis=app.context.apis = apis;
// app.context.OSapi=OSapi;
app.context.topics = topics;
app.context.X2js = X2js;
app.context.groupBy = groupBy;
globalThis.agriApp.log4js = app.context.log4js = log4js;
app.context.saveJson = saveJson;
globalThis.agriApp.getJson = app.context.getJson = getJson;
app.context.getJsonTemp = getJsonTemp;
app.context.clearDir = clearDir;
globalThis.agriApp.Mqtt = app.context.Mqtt = new Mqtt({
  connectUrl: topics.host,
}); //MQTT实例
app.context.topics = []; //维护一个订阅监测单元列表（未用到）





// 中间件
/**
 * 跨域配置
 */
app.use(
  cors({
    origin: function (ctx) {
      // if (ctx.url === '/test') {
      //   return false;
      // }
      return "*";
    },
    exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
    maxAge: 5,
    credentials: true,
    allowMethods: ["GET", "POST", "DELETE", "PUT", "OPTION"],
    allowHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);

/**
 * 请求体解析
 */
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger()); //自带控制台日志

/**
 * 静态资源
 */
app.use(require("koa-static")(__dirname + "/public"));

/**
 * swagger 生成环境需注释
 */
app.use(
  koaSwagger({
    routePrefix: "/swagger/index.html", // 这里配置swagger的访问路径
    swaggerOptions: {
      url: "/swagger/swagger.json", // 这里配置swagger的文档配置URL，也就是说，我们展示的API都是通过这个接口生成的。
    },
  })
);

/**
 * 请求日志
 */
app.use(async (ctx, next) => {
  ctx.log4js.logInfo(`${ctx.method} ${ctx.url} - 请求开始`);
  const start = new Date();
  await next();
  const ms = new Date() - start;
  ctx.log4js.logInfo(`${ctx.method} ${ctx.url} - ${ms}ms - 请求结束`);
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});

/**
 * 自定义未授权返回消息,必须放在jwt前面
 */
app.use(function (ctx, next) {
  return next().catch((err) => {
    let result;
    if (401 == err.status) {
      result = ctx.ResultBody._unauthorized();
      ctx.response.status = 401;
      ctx.body = result;
    } else {
      throw err;
    }
  });
});

/**
 * JWT认证
 */
app.use(
  koajwt({
    secret: "iotouccs",
  }).unless({
    // 配置白名单
    path: [
      /\/grant\/authorization/,
      /\/grant\/*/,
      /\/swagger\//,
      // /\/api\/index/,
      // /\/testUnit\/*/,
      // /\/scene\/*/,
      // /\/comconfig\/*/,
      // /\/navigation\/*/,
    ],
  })
);


/**
 * 启动路由
 */
app.use(users.routes(), users.allowedMethods());
app.use(comconfig.routes(), comconfig.allowedMethods());
app.use(testunit.routes(), testunit.allowedMethods());
app.use(navigation.routes(), navigation.allowedMethods());
app.use(scene.routes(), scene.allowedMethods());
app.use(datahandler.routes(), datahandler.allowedMethods());


//生产环境注释
app.use(swagger.routes(), swagger.allowedMethods());

/**
 * 错误处理,捕获未处理异常
 */
app.on("error", (err, ctx) => {
  ctx.log4js.logError(err);
  console.error("server error", err);
});




module.exports = app;