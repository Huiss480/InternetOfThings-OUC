/**
 * 封装x2js,xml和json互转
 */

const x2js = require("x2js");

function X2js() {
    this.xml = '';
    this.json = {};
}
X2js.ix2js = new x2js();

X2js.prototype.xml2json = function () {
    this.json = X2js.ix2js.xml2js(this.xml);
}
X2js.prototype.json2xml = function () {
    this.xml = X2js.ix2js.js2xml(this.json);
}

/**
 * 使用方法
 */
function example() {
    let example = new X2js();
    example.xml = `<>`;
    example.xml2json();
    console.log(example.json);
    example.json2xml();
    console.log(example.xml);
}
//example();
module.exports = X2js;
