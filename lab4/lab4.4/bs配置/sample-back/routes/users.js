const router = require('koa-router')();
const jwt = require("jsonwebtoken");

const userInfo = {
  username: 'iot',
  password: 'ouccs'
};

/**
 * 权限路由
 */
router.prefix('/grant')


/**
 * @swagger
 * /grant:
 *   get: 
 *      tags:
 *          - grant
 *      summary: 测试服务是否可用
 *      description: 测试服务是否可用
 *      produces:
 *          - "application/json"
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
router.get('/', function (ctx, next) {
  //console.log(ctx.ResultBody)
  ctx.body = ctx.ResultBody._true();
})



/**
 * @swagger
 * /grant/authorization:
 *  post: 
 *      tags:
 *          - grant
 *      summary: 获取接口授权
 *      description: 获取接口授权
 *      consumes:
 *          - "application/json"
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: body
 *            name: userInfo
 *            description: body的描述
 *            required: true
 *            schema:
 *               type: 'object'
 *               properties:
 *                  username:
 *                      type: 'string'
 *                      description: 用户名
 *                  password:
 *                      type: 'string'
 *                      description: 密码
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
 *               properties:
 *                      token:
 *                        type: 'string'
 *                        description: 验证token
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
router.post('/authorization', function (ctx, next) {
  const data = ctx.request.body;
  let result;
  if (!data.username || !data.password) {
    result = ctx.ResultBody._badRequest();
    ctx.response.status = 200;
    return ctx.body = result;
  }
  //执行验证
  if (data.username == userInfo.username && data.password == userInfo.password) {
    const token = jwt.sign(
      {//payload
        name: data.username,
        test: "test"
      },
      "iotouccs", // secret
      { expiresIn: 60 * 60 * 60 } // 60 * 60 s
    );
    result = ctx.ResultBody._true();
    result.message = '授权成功！';
    result.data.token = token;
    return ctx.body = result;
  } else {
    result = ctx.ResultBody._badRequest();
    result.message = '账号或密码错误！';
    ctx.response.status = 200;
    return ctx.body = result;
  }


})

module.exports = router
