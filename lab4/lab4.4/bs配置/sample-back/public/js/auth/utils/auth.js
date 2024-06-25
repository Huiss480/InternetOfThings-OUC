async function requestToken(request) {
  let result = await request({
    url: http_apis.authorization.URI,
    method: http_apis.authorization.method,
    data: {
      username: "iot",
      password: "ouccs",
    },
  });
  //console.log(result)
  localStorage.setItem("token", result.data.token);
  return result;
}

function getToken(request) {
  let token = localStorage.getItem("token");
  // if (token == null) {
  //     await requestToken(request);
  //     token = localStorage.getItem('token');
  // }
  return token;
}

function removeToken() {
  return localStorage.removeItem("token");
}