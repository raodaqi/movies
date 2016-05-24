var AV = require('leanengine');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('hello', function(request, response) {
  response.success('Hello world!');
});

AV.Cloud.define("getData", function(request, response) {
  console.log('Log in timer.');
  // appJs.cronGetData();
  appJs.getCUITImportentData();
  // appJs.getJWCImportentData();
  console.log("Log in timer.");
});

AV.Cloud.define("moviesDelete", function(request, response) {
  appJs.moviesDelete();
  console.log("清空movies里的所有数据");
});

AV.Cloud.define("getMoviesData", function(request, response) {
  appJs.getMoviesData();
  console.log("获取电影列表");
});

AV.Cloud.define("getBJMovies", function(request, response) {
  appJs.getBJMovies();
  console.log("获取比价网电影列表");
});

AV.Cloud.define("getNMNewMovie", function(request, response) {
  appJs.getNMNewMovie();
  console.log("获取百度糯米正在上映电影");
});

AV.Cloud.define("sendLowPriceEmail", function(request, response) {
  appJs.sendLowPriceEmail();
  console.log("发送低价邮件");
});

module.exports = AV.Cloud;
