/**
 * 数据处理
 */
const router = require("koa-router")(),
  datahandler = require("../services/s-datahandler.js"),
   crypto = require("../utils/crypto2str.js");;

/**
 * 数据处理路由
 */
router.prefix("/datahandler");

/**
 * @swagger
 * /datahandler/historyData:
 *  get:
 *      tags:
 *          - datahandler
 *      summary: 获取一次监测的所有历史数据
 *      description: 根据primaryKey获取一次监测的所有历史数据
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: query
 *            name: primaryKey
 *            description: 开测primaryKey
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
router.get("/historyData", async function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  //   let key=crypto.str2sha256('agri'+ctx.request.query.primaryKey);
  // let keyExist =await ctx.redisClient.exists(key);
  // // console.log(keyExist)
  // if (keyExist == 1 && ctx.redisClient.status == 'ready') {
  //   data = JSON.parse( await ctx.redisClient.get(key));
  // } else {
    let tempresult;
    try {
      tempresult =
        // await ctx.getJsonTemp('keep_data','receiveHistoryData');
        await datahandler.getHistortDataByPrimaryKey(
          ctx,
          ctx.request.query.primaryKey
        );
      // console.log("tempresult", tempresult);
    } catch (e) {
      console.log(e);
    }

    data = await datahandler.historyDataHandler(
      ctx,
      ctx.request.query.primaryKey,
      tempresult
    );
    // if (ctx.request.query.testNow == 'false') {
    //   await ctx.redisClient.set(key, JSON.stringify(data));
    // } else if (ctx.request.query.testNow == 'true') {
    //   await ctx.redisClient.set(key, JSON.stringify(data), 'EX', 15);
    // }
  // }

  result.data = data;
  ctx.body = result;
});

/**
 * @swagger
 * /datahandler/currentData:
 *  get:
 *      tags:
 *          - datahandler
 *      summary: 获取某个监测单元最新采集数据
 *      description: 根据监测单元号获取最新采集数据
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
 *          - in: query
 *            name: testTime
 *            description: 开测时间
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
router.get("/currentData", async function (ctx, next) {
  console.time();
  let data,
    result = ctx.ResultBody._true();
  let tempresult;
  try {
    tempresult = await datahandler.getCurrentDataByTestUnitNo(
      //datahandler.getCurrentDataByTestUnitNo
      ctx,
      //ctx.request.query.testUnitNo,
      ctx.request.query.testUnitNo,
      limit = 100
    );
  } catch (e) {
    console.log(e);
  }
  data = datahandler.currentDataHandler(ctx, tempresult);
  result.data = data;
  console.timeEnd();
  ctx.body = result;
});

/**
 * @swagger
 * /datahandler/currentSensorData:
 *  get:
 *      tags:
 *          - datahandler
 *      summary: 获取某个监测单元下传感器最新采集数据
 *      description: 根据监测单元号和传感器名获取最新采集数据
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
 *          - in: query
 *            name: testTime
 *            description: 开测时间
 *            required: true
 *          - in: query
 *            name: sensorName
 *            description: 传感器名
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
router.get("/currentSensorData", async function (ctx, next) {
  console.time();
  let data,
    result = ctx.ResultBody._true();
  let tempresult;
  try {
    tempresult = await datahandler.getCurrentDataByTestUnitNo(
      ctx,
      ctx.request.query.testUnitNo,
      limit = 100
    );
  } catch (e) {
    console.log(e);
  }

  data = datahandler.currentSensorDataHandler(ctx, tempresult);
  result.data = data;
  console.timeEnd();
  ctx.body = result;
});

module.exports = router;