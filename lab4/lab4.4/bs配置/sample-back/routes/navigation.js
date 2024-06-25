const router = require('koa-router')();



/**
 * 应用软件导航路由
 */
router.prefix('/navigation');


/**
 * @swagger
 * /navigation/init:
 *  get: 
 *      tags:
 *          - navigation
 *      summary: 获取导航树
 *      description: 获取导航树
 *      consumes:
 *          - "application/json"
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
 *               type: 'boolean'
 *               description: 是否成功
 *               default: true
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *             data:
 *               type: 'object'
 *               description: 返回数据
 *       '400':
 *         description: 请求参数错误
 *         schema:
 *           type: 'object'
 *           properties:
 *             code:
 *               type: 'number'
 *               description: 状态码
 *             success:
 *               type: 'boolean'
 *               description: 是否成功
 *               default: false
 *             message:
 *               type: 'string'
 *               description: 消息提示
 *       '404':
 *         description: not found
 */
router.get('/init', function (ctx, next) {
    let data, result = ctx.ResultBody._true();
    data = ctx.getJson('temp_data', 'Navigation').Navigation;
    result.data = data;
    ctx.body = result;

})



module.exports = router