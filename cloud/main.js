var appJs = require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("getData", function(request, response) {
  console.log('Log in timer.');
  // appJs.cronGetData();
  appJs.getCUITImportentData();
  // appJs.getJWCImportentData();
  response.success("Log in timer.");
});

AV.Cloud.define("moviesDelete", function(request, response) {
  appJs.moviesDelete();
  response.success("清空movies里的所有数据");
});

AV.Cloud.define("getMoviesData", function(request, response) {
  appJs.getMoviesData();
  response.success("获取电影列表");
});

AV.Cloud.define("getBJMovies", function(request, response) {
  appJs.getBJMovies();
  response.success("获取比价网电影列表");
});

AV.Cloud.define("getNMNewMovie", function(request, response) {
  appJs.getNMNewMovie();
  response.success("获取百度糯米正在上映电影");
});

AV.Cloud.define("sendLowPriceEmail", function(request, response) {
  appJs.sendLowPriceEmail();
  response.success("发送低价邮件");
});
