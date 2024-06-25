window.openTest = async function (id, metaData) {
  let result = await request({
    url: http_apis.testUnit.openTest.URI,
    method: http_apis.testUnit.openTest.method,
    params: {
      testUnitNo: id,
      origin: window.location.origin,
      content: metaData,
    },
  });
  if (result.code == 20000) {
    return true;
  } else {
    return false;
  }
};
window.stopTest = async function (id) {
  let result = await request({
    url: http_apis.testUnit.stopTest.URI,
    method: http_apis.testUnit.stopTest.method,
    params: {
      testUnitNo: id,
    },
  });
  if (result.code == 20000) {
    return true;
  } else {
    return false;
  }
};
window.appInit = async function () {
  await request({
    url: http_apis.comconfig.appInit.URI,
    method: http_apis.comconfig.appInit.method,
    params: {},
  });
};
