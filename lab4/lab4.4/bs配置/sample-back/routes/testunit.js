const router = require("koa-router")(),
  testunit = require("../services/s-testunit.js"),
  comconfig = require("../services/s-comconfig.js"),
  applicationInfo = require("../config/applicationInfo.js");

/**
 * 应用软件监测单元路由
 */
router.prefix("/testUnit");

/**
 * @swagger
 * /testUnit/singleTestUint/{testUnitId}:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 获取单个监测单元信息
 *      description: 根据监测单元号获取单个监测单元信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: path
 *            name: testUnitId
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
 *               description:  监测单元信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/singleTestUint/:testUnitId", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = testunit.getTestUnit(ctx.params.testUnitId, ctx);
  result.data = data;
  ctx.body = result;
});

/**
 * @swagger
 * /testUnit/multiTestUint:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 获取多个监测单元信息
 *      description: 根据监测单元号获取多个监测单元信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: query
 *            name: testUnitIds
 *            required: true
 *            type: array
 *            items:
 *              type: string
 *            collectionFormat: multi
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
 *               type: 'array'
 *               description:  监测单元数组信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/multiTestUint", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = testunit.getTestUnit(ctx.query.testUnitIds, ctx);
  result.data = data;
  ctx.body = result;
});

// #region
/**
 * @swagger
 * /testUnit/allTestUnits:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 获取所有监测单元信息
 *      description: 获取所有监测单元信息
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
router.get("/allTestUnits", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = testunit.getAllTestUnit(ctx);
  result.data = data;
  ctx.body = result;
});

// #region
/**
 * @swagger
 * /testUnit/testUnitStatus:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 获取监测单元监测状态
 *      description: 获取监测单元监测状态
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
 *          - in: query
 *            name: testUnitIds[]
 *            description: 监测单元号
 *            required: true
 *            type: array
 *            items:
 *              type: string
 *            collectionFormat: multi
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
router.get("/testUnitStatus", async function (ctx, next) {
  let result;
  let query = ctx.request.query;
  try {
    let temp = await comconfig.getConfigFile(applicationInfo.ProjectCode);
    query.ip = temp.data[0];
    query.port = temp.data[1];
    query.ProjectCode = applicationInfo.ProjectCode;
    let data = await testunit.getTestUnitStatus(ctx, query);
    data = JSON.parse(data.data);
    let status = null;
    console.log(query["testUnitIds[]"]);
    if (
      Object.prototype.toString.call(query["testUnitIds[]"]).indexOf("Array") !=
      -1
    ) {
      //数组 数组长度为1时有BUG，已解决
      status = [];
      query["testUnitIds[]"].forEach((e, i, a) => {
        let index=data.testUnitNo.indexOf(parseInt(e));
        if (index!=-1) {
          status.push({status:"true",testTime:data.beginDateTime[index]});
        } else {
          status.push({status:"false",testTime:''});
        }
      });
    } else {
      //单值
      let index=data.testUnitNo.indexOf(parseInt(query["testUnitIds[]"]));
      if (index!=-1) {
        status = {status:"true",testTime:data.beginDateTime[index]};
      } else {
        status = {status:"false",testTime:''};
      }
    }
    // if (data.includes(query['testUnitIds[]'])) {
    //     status.push(true);
    // } else {
    //     status.push(false);
    // }
    //data = comconfig.testHistoryHandler(data);
    // console.log(data);
    result = ctx.ResultBody._true();
    result.message = "获取成功!";
    result.data = status;
    ctx.body = result;
  } catch (e) {
    console.log(e);
    result = ctx.ResultBody._false();
    result.message = "获取失败!";

    ctx.body = result;
  }
});

/**
 * @swagger
 * /testUnit/singleTestUintTableHeader/{testUnitId}:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 获取单个监测单元参数表头
 *      description: 根据监测单元号获取单个监测单元参数表头
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: path
 *            name: testUnitId
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
 *               description:  监测单元信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/singleTestUintTableHeader/:testUnitId", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = testunit.getTestUnitHistoryHeader(ctx.params.testUnitId, ctx);
  result.data = data;
  ctx.body = result;
});

/**
 * @swagger
 * /testUnit/singleTestUintVideoinfo/{testUnitId}:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 获取单个监测单元视频通道信息
 *      description: 根据监测单元号获取单个监测单元视频通道信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: path
 *            name: testUnitId
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
 *               description:  监测单元信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
 router.get("/singleTestUintVideoinfo/:testUnitId", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = testunit.getTestUnitVideoInfo(ctx.params.testUnitId, ctx);
  result.data = data;
  ctx.body = result;
});

/**
 * @swagger
 * /testUnit/openTest:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 开始监测
 *      description: 根据监测单元号开始监测
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: query
 *            name: testUnitNo
 *            description: 监测单元号
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
 *               description:  监测单元信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/openTest", async function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  let query = ctx.request.query;
  query.ProjectCode = applicationInfo.ProjectCode;
  query.content = "sample";//该参数无所谓 是字符串就行
  data = await testunit.openTest(ctx, query);
  if (data.code == 20001) { 
    result.false();
    result.message = "开测失败";
  } else {
    let temp = await comconfig.getConfigFile(applicationInfo.ProjectCode);
    query.ip = temp.data[0];
    query.port = temp.data[1];
    // let res = await testunit.uploadMetaData(ctx);
    let res=true;
    if (res) {
      
      result.message = "开测成功";
    } else {
      result.false();
      result.message = "开测失败";
    }
  }

  ctx.body = result;
});

/**
 * @swagger
 * /testUnit/stopTest:
 *  get:
 *      tags:
 *          - testUnit
 *      summary: 停止监测
 *      description: 根据监测单元号停止监测
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: query
 *            name: testUnitNo
 *            description: 监测单元号
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
 *               description:  监测单元信息
 *       '400':
 *         description: 请求参数错误
 *       '404':
 *         description: not found
 *
 */
router.get("/stopTest", async function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  let query = ctx.request.query;
  query.ProjectCode = applicationInfo.ProjectCode;
  data = await testunit.stopTest(ctx, query);
  if (data.code == 20001) {
    result.false();
    result.message = "停测失败";
  } else {
  
    result.message = "停测成功";
  }
  ctx.body = result;
});
module.exports = router;
