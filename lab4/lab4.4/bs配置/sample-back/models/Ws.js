const WebSocket = require('ws');
class WS {
    static online = 0 // 在线连接
    static ws = WebSocket.Server //默认实例
    static init(server) {
        // 创建实例,静态方法中使用this,指向Class类本身，而不是实例，所以，这里是给类绑定了个ws实例
        this.ws = new WebSocket.Server({ server, path: '/websockets' });

        this.ws.on('connection', async (ws, request) => {
            if (!(request.url.includes('/websockets'))) {
                return ws.close();
            }
            ws.id = request.headers['sec-websocket-key']; // 添加ws实例的唯一标识
            this.online = this.ws._server._connections;
            console.log(`socket当前在线${this.online}个连接`)
            ws.on('message', function (jsonStr, flags) {
                //先连websocket,获取sec-websocket-key并返回
                //然后调用发布mqtt主题请求携带sec-websocket-key
                //调用发布主题后订阅主题，回调调用sendToCliect
                //判断message,调用函数，返回数据
                //console.log('message1', this, ws)//此处this同ws
                //console.log(ws.id)
                //此处返回消息不用判断是哪个客户端，是会话级别的
                ws.send(`您发送了：${jsonStr}`)
            })


            try {
                const obj = { "message": "连接成功", "retCode": 200 }
                ws.send(JSON.stringify(obj))
            } catch (error) {
                console.log('websocket connection error', error)
                return ws.close();
            }
        });
    }
    // 发送客户端数据
    static sendToCliect(mqtt, Data) {
        let iskeep = false // 加个变量做下发成功判断
        if (!(this.ws instanceof WebSocket.Server)) {
            return iskeep;
        }
        const { id } = Data
        this.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.id === id) {
                // 发送给指定匹配id
                client.send(JSON.stringify(Data));
                iskeep = true
            }
        });
        return iskeep;
    }
}
module.exports = WS