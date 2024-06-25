/**
 * @param code
 * @yields 20000 正常
 * @yields
 *
 */

function ResultBody({
  code = 20000,
  message = "success",
  success = true,
  data = {},
}) {
  this.code = code;
  this.message = message;
  this.success = success;
  this.data = data;
}
ResultBody.prototype.true = function () {
  this.code = 20000;
  this.message = "请求成功！";
  this.success = true;
};

ResultBody.prototype.false = function () {
  this.code = 20001;
  this.message = "请求失败！";
  this.success = false;
};
ResultBody._true = function () {
  return new ResultBody({
    code: 20000,
    message: "请求成功！",
    success: true,
  });
};

ResultBody._false = function () {
  return new ResultBody({
    code: 20001,
    message: "请求失败！",
    success: false,
  });
};
ResultBody._badRequest = function () {
  //400
  return new ResultBody({
    code: 20002,
    message: "参数不合法！",
    success: false,
  });
};
ResultBody._unauthorized = function () {
  //401
  return new ResultBody({
    code: 20003,
    message: "非法访问，请先申请授权！",
    success: false,
  });
};
ResultBody._isDependency = function () {
  return new ResultBody({
    code: 20004,
    message: "数据被依赖无法删除！",
    success: false,
  });
};
module.exports = ResultBody;
