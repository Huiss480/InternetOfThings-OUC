/**
 * 对接comconfig
 */
const router = require("koa-router")(),
  comconfig = require("../services/s-comconfig.js"),
  applicationInfo = require("../config/applicationInfo.js");

router.prefix("/comconfig");

/**
 * @swagger
 * /comconfig:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 测试服务是否可用
 *      description: 测试服务是否可用
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *      responses:
 *       '200':
 *         description: OK
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             success:
 *               type: boolean
 *               description: 是否成功
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/", function (ctx, next) {
  ctx.body = ctx.ResultBody._true();
});

/**
 * @swagger
 * /comconfig/appInit:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 系统初始化
 *      description: 调用mainController初始化数据组件
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *      responses:
 *       '200':
 *         description: OK
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             success:
 *               type: boolean
 *               description: 是否成功
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *             data:
 *               type: 'object'
 *               description:  位置信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/appInit", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = comconfig.appInit(applicationInfo.ProjectCode);
  result.data = data;
  ctx.body = result;
});

// #region
/**
 * @swagger
 * /comconfig/dataConfigFile:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 获取comconfig接口信息
 *      description: 获取comconfig接口信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          #- in: query
 *          #  name: ProjectCode
 *          #  description: 项目代号
 *          #  required: true
 *      responses:
 *       '200':
 *         description: Ok
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 */
// #endregion
router.get("/dataConfigFile", async function (ctx, next) {
  let result = ctx.ResultBody._true();
  let temp = await comconfig.getConfigFile(applicationInfo.ProjectCode);
  result.data = temp.data;

  ctx.body = result;
});

// #region
/**
 * @swagger
 * /comconfig/InitAllComponentConfig:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 获取项目下原始xml转json
 *      description: 获取所有配置并转为json持久化
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          #- in: query
 *          #  name: ip
 *          #  description: comconfigip地址
 *          #  default: 127.0.0.1
 *          #  required: true
 *          #- in: query
 *          #  name: port
 *          #  description: comconfig端口
 *          #  default: 8082
 *          #  required: true
 *          #- in: query
 *          #  name: ProjectCode
 *          #  description: 项目代号
 *          #  required: true
 *          #- in: query
 *          #  name: ComponentName
 *          #  description: 组件名称
 *          #  default: DataComm
 *          #  required: true
 *      responses:
 *       '200':
 *         description: Ok
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 */
// #endregion
router.get("/InitAllComponentConfig", async function (ctx, next) {
  let result;
  let configs = [
    "DataComm",
    "Nameplate",
    "Navigation",
    "CurveControl",
    "SystemInfo",
  ];
  let query = ctx.request.query;
  let temp = await comconfig.getConfigFile(applicationInfo.ProjectCode);
  // console.log(temp.data);
  query.ip = temp.data[0];
  query.port = temp.data[1];
  query.ProjectCode = applicationInfo.ProjectCode;
  try {
    for (let i of configs) {
      query.ComponentName = i;
      let data = await comconfig.DownloadComponentConfig(query);
      comconfig.persistenceJSON(data);
    }
    result = ctx.ResultBody._true();
    result.message = "初始化成功!";
    ctx.body = result;
  } catch (e) {
    console.log(e);
    result = ctx.ResultBody._false();
    result.message = "初始化失败!";
    ctx.body = result;
  }
});

// #region
/**
 * @swagger
 * /comconfig/InitOneComponentConfig:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 获取项目下单个原始xml转json
 *      description: 获取单个配置并转为json持久化
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *         # - in: query
 *         #   name: ProjectCode
 *         #   description: 项目代号
 *         #   required: true
 *          - in: query
 *            name: ComponentName
 *            description: 组件名称
 *            default: DataComm
 *            required: true
 *      responses:
 *       '200':
 *         description: Ok
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 */
// #endregion
router.get("/InitOneComponentConfig", async function (ctx, next) {
  let result;
  let query = ctx.request.query;
  let temp = await comconfig.getConfigFile(applicationInfo.ProjectCode);
  query.ip = temp.data[0];
  query.port = temp.data[1];
  query.ProjectCode = applicationInfo.ProjectCode;
  try {
    let data = await comconfig.DownloadComponentConfig(query);
    comconfig.persistenceJSON(data);
    result = ctx.ResultBody._true();
    result.message = "更新成功!";
    ctx.body = result;
  } catch (e) {
    console.log(e);
    result = ctx.ResultBody._false();
    result.message = "更新失败!";
    ctx.body = result;
  }
});

// #region
/**
 * @swagger
 * /comconfig/unitTestRecords:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 获取某个监测单元的开测记录
 *      description: 获取某个监测单元的开测记录
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *         # - in: query
 *         #   name: ProjectCode
 *         #   description: 项目代号
 *         #   required: true
 *          - in: query
 *            name: ComponentName
 *            description: 组件名称
 *            default: DataComm
 *            required: true
 *          - in: query
 *            name: testUnitId
 *            description: 监测单元号
 *            required: true
 *      responses:
 *       '200':
 *         description: Ok
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 */
// #endregion
router.get("/unitTestRecords", async function (ctx, next) {
  let result;
  let query = ctx.request.query;
  try {
    let temp = await comconfig.getConfigFile(applicationInfo.ProjectCode);
    console.log(temp)
    query.ip = temp.data[0];
    query.port = temp.data[1];
    query.ProjectCode = applicationInfo.ProjectCode;
    let data = await comconfig.DownloadAllComponentConfig(query);
    //console.log(data)
    data = comconfig.testHistoryHandler(data);
    // console.log(data);
    result = ctx.ResultBody._true();
    result.message = "获取成功!";
    result.data = data;
    ctx.body = result;
  } catch (e) {
    console.log(e);
    result = ctx.ResultBody._false();
    result.message = "获取失败!";
    ctx.body = result;
  }
});

// #region
/**
 * @swagger
 * /comconfig/sysInfo:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 获取软件系统信息
 *      description: 获取软件系统信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *      responses:
 *       '200':
 *         description: Ok
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 */
// #endregion
router.get("/sysInfo", async function (ctx, next) {
  let result;
  try {
    let sysInfo = ctx.getJson("temp_data", "SystemInfo");
    result = ctx.ResultBody._true();
    result.data = sysInfo;
    result.message = "获取成功!";
    ctx.body = result;
  } catch (e) {
    result = ctx.ResultBody._false();
    result.message = "获取失败!";
    ctx.body = result;
  }
});

// #region
/**
 * @swagger
 * /comconfig/testUnitsOption:
 *  get:
 *      tags:
 *          - comconfig
 *      summary: 获取监测单元列表
 *      description: 获取监测单元列表
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *      responses:
 *       '200':
 *         description: Ok
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 */
// #endregion
router.get("/testUnitsOption", async function (ctx, next) {
  let result;
  try {
    let testUnitsOption = ctx.getJson("temp_data", "testUnitsOption");
    result = ctx.ResultBody._true();
    result.data = testUnitsOption ;
    result.message = "获取成功!";
    ctx.body = result;
  } catch (e) {
    result = ctx.ResultBody._false();
    result.message = "获取失败!";
    ctx.body = result;
  }
});


module.exports = router;
