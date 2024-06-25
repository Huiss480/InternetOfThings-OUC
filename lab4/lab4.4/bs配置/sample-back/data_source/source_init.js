const path = require('path');
const fs = require('fs-extra');
const log4js = require('../logger/log4js');

/**
 * 本文件用来操作data_source下temp_data和keep_data子文件内的json文件
 */


/**
 * 获取json文件内对象
 * @param {*} filepath 文件路径
 * @param {*} filename 文件名
 * @returns json对象
 */
function getJson(filepath, filename) {
    log4js.logInfo("---读取json文件---");
    return fs.readJsonSync(path.join(__dirname, `./${filepath}/${filename}.json`));
}

function getJsonTemp(filepath, filename) {
    return new Promise((resolve,reject)=>{
        log4js.logInfo("---读取json文件---");
        resolve( fs.readJsonSync(path.join(__dirname, `./${filepath}/${filename}.json`)));
    })
    
}

/**
 * 保存对象到json文件
 * @param {*} filepath 文件路径
 * @param {*} filename 文件名
 * @param {*} data json对象
 * @returns null
 */
function saveJson(filepath, filename, data) {
    log4js.logInfo("---写json文件---");
    return fs.outputJsonSync(path.join(__dirname, `./${filepath}/${filename}.json`), data);
}

/**
 * 使用方法
 */
function example() {

}
// example();

module.exports.getJson = getJson;
module.exports.getJsonTemp = getJsonTemp;
module.exports.saveJson = saveJson;