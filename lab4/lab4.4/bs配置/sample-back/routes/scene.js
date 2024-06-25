const router = require("koa-router")(),
  scene = require("../services/s-scene.js");

/**
 * 场景路由
 */
router.prefix("/scene");

/**
 * @swagger
 * /scene/sceneInitInfo:
 *  get:
 *      tags:
 *          - scene
 *      summary: 获取数据大屏页面内导航及监测单元信息
 *      description: 根据导航节点号获取导航及其包含监测单元信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: query
 *            name: navId
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
router.get("/sceneInitInfo", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = scene.getSceneInitInfo(ctx.query.navId, ctx);
  result.data.params = data;
  ctx.body = result;
});

/**
 * @swagger
 * /scene/sceneTestUnitInitInfo:
 *  get:
 *      tags:
 *          - scene
 *      summary: 获取监测单元实时数据相关参数图例
 *      description: 根据监测单元号获取导航及其包含监测单元信息
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: query
 *            name: testunitId
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
router.get("/sceneTestUnitInitInfo", function (ctx, next) {
  let data,
    result = ctx.ResultBody._true();
  data = scene.getTestUnitCurrentDatalegend(ctx.query.testunitId, ctx);
  result.data = data;
  ctx.body = result;
});



module.exports = router;
