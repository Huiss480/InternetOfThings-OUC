/**
 * @swagger
 * /test/testpost:
 *  post: 
 *      tags:
 *          - test
 *      summary: 总结
 *      description: 描述
 *      consumes:
 *          - "application/json"
 *      produces:
 *          - "application/json"
 *      parameters:
 *          - in: header
 *            name: Authorization
 *            required: true
 *          - in: body
 *            name: key
 *            description: body内参数key的描述
 *            required: true
 *            schema:
 *               type: 'object'
 *               properties:
 *                  data:
 *                     type: 'object'
 *                     description: 返回数据
 *                     properties:
 *                       data:
 *                           type: 'object'
 *                           description: 返回数据
 *                  message:
 *                      type: 'string'
 *                      description: 消息提示
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


/**
 * @swagger
 * /test/testget:
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
 *          - in: query
 *            name: test1
 *            description: 项目代码
 *            required: true
 *          - in: path
 *            name: test
 *            description: 测试
 *          - in: query
 *            name: testUnitIds
 *            required: true
 *            type: array #传递多个值
 *            items:
 *              type: string
 *            collectionFormat: multi #分开传
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