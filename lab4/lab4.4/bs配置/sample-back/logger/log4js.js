const path = require('path')
const log4js = require('log4js'); //加载log4js模块

log4js.configure({
    appenders: {
        info: {
            type: "file",
            filename: path.join(__dirname, 'logs', 'info', 'info'),// 您要写入日志文件的路径
            //compress: true, //（默认为false） - 在滚动期间压缩备份文件（备份文件将具有.gz扩展名）
            // pattern: "yyyy-MM.log", //（可选，默认为.yyyy-MM-dd） - 用于确定何时滚动日志的模式。格式:.yyyy-MM-dd-hh:mm:ss.log
            encoding: 'utf-8', // default "utf-8"，文件的编码
             backups : 2, 
            //  maxLogSize: 1024,
            maxLogSize: 100*1024*1024*8, // 文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件xxx.log.1的序列自增长的文件
            // alwaysIncludePattern: true, //（默认为false） - 将模式包含在当前日志文件的名称以及备份中
        },
        error: {// 错误日志
            type: 'dateFile',
            filename: path.join(__dirname, 'logs', 'error', 'error'),
            pattern: 'yyyy-MM-dd.log',
            encoding: 'utf-8', // default "utf-8"，文件的编码
             numBackups : 7, 
            maxLogSize: 20*1024*1024*8, // 文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件xxx.log.1的序列自增长的文件
            // alwaysIncludePattern: true
        }
    },
    categories: {
        default: { appenders: ['info'], level: 'info' },
        info: { appenders: ['info'], level: 'info' },
        error: { appenders: ['error'], level: 'error' }
    }
});


/**
 * 错误日志记录方式
 * @param {*} content 日志输出内容
 */
function logError(content) {
    const log = log4js.getLogger("error");
    log.error(content)
}
/**
 * 日志记录方式
 * @param {*} content 日志输出内容
 */
function logInfo(content) {
    const log = log4js.getLogger("info");
    log.info(content)
}

module.exports = {
    logError,
    logInfo
}