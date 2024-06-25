const axios = require('axios'),
    apis = require('../config/apis').http_apis;


// 创建request实例
const request = axios.create({
    baseURL: apis.baseURL, // url = baseURL + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 0 // request timeout
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 发送请求时的通用配置，如添加header
        //config.headers['X-Token'] = getToken()
        // if (store.getters.token) {
        //     // let each request carry token
        //     // ['X-Token'] is a custom headers key
        //     // please modify it according to the actual situation
        //     config.headers['X-Token'] = getToken()
        // }
        return config
    },
    error => {
        // do something with request error
        // console.log(error) // for debug
        return { code: 20001, success: false };
    }
)

// 返回拦截器
request.interceptors.response.use(
    //根据返回状态码做一些处理

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data

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
            return { code: 20001, success: false };
        } else {
            return res
        }
    },
    error => {
        // console.log('err', error) // for debug
        // Message({
        //     message: error.message,
        //     type: 'error',
        //     duration: 5 * 1000
        // })
        return { code: 20001, success: false };
    }
)



/**
 * 使用方法
 */
function example(params) {
    request({
        url: '/sample/url',
        method: 'get',
        params: query
    })
}

module.exports = request;