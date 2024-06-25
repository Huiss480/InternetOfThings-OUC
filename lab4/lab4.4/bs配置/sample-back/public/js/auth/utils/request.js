// 创建request实例
const request = axios.create({
  baseURL: http_apis.baseURL, // url = base url + request url
  // withCredentials: true, // 发送cookie 跨域时
  timeout: 20000, // request timeout
});
window.request = request;

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 发送请求时的通用配置，如添加header
    let Authorization = "Bearer " + getToken(request);
    // console.log(Authorization)
    config.headers["Authorization"] = Authorization;

    return config;
  },
  (error) => {
    // 错误处理
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// 返回拦截器
request.interceptors.response.use(
  //根据返回状态码做一些处理

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data;

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      // Message({
      //     message: res.message || 'Error',
      //     type: 'error',
      //     duration: 5 * 1000
      // })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        // MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        //     confirmButtonText: 'Re-Login',
        //     cancelButtonText: 'Cancel',
        //     type: 'warning'
        // }).then(() => {
        //     store.dispatch('user/resetToken').then(() => {
        //         location.reload()
        //     })
        // })
      }
      // console.log(res.message);
      return res;
    } else {
      return res;
    }
  },
  (error) => {
    //处理异常请求
    // console.log("err", error); // for debug
    app.showMessage(error.message, "warning");
    if (error.code == "ECONNABORTED") {
      // app.addSysMonitorRecord("请求超时...");
    }
    try {
      if (error.response.status === 401) {
        app.showMessage("未授权", "error");
        console.log("未授权");
        location.reload();
      }
    } catch (e) {}

    return { code: 20001, success: false };
  }
);

// export default request

//使用方法
function exampleRequest(params) {
  request({
    url: "/comconfig/getConfigFile",
    method: "post",
    data: params,
  });
}
// exampleRequest({
//     "username": "iot",
//     "password": "string"
// })
// app.request = request;
