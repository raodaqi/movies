//leanengine配置
var AV = require('leanengine');

// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var app = express();
var path = require('path');
var schedule = require("node-schedule");
var http =  require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

var APP_ID = 'e3spBa4YjoxnmSLeo5VLAWC1-gzGzoHsz'; // 你的 app id
var APP_KEY =  'YgpmPcXI1uql1Rwr2b85IJRb'; // 你的 app key
var MASTER_KEY =  'hwzTQUzTGWjIctpJq5h5HUpd'; // 你的 master key

AV.initialize(APP_ID, APP_KEY, MASTER_KEY);

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(__dirname, 'public'));
app.use(AV.Cloud.CookieSession({ secret: 'my secret', maxAge: 3600000, fetchUser: true }));



/*
**保存公告数据
** data:一个保存了表单信息的json。find：需要查找是否存在相同的元素。callback：回调函数；成功返回“success”，失败返回“error”；
 */
function saveMoviesData(data,find,callback){
	var post = AV.Object.new('Movies');
	console.log(data);
	var query = new AV.Query('Movies');
	query.equalTo(find, data[find]);
	query.find().then(function(results) {
	  console.log('Successfully retrieved ' + results.length + ' posts.');
	  // 处理返回的结果数据
	  console.log(results.length);
		if(results.length=="0"){
			for(var key in data){
				post.set(key, data[key]);
			}
			post.save().then(function(post) {
			  // 成功保存之后，执行其他逻辑.
			  console.log('New object created with objectId: ' + post.id);
				callback.success("success");
			}, function(err) {
			  // 失败之后执行其他逻辑
			  // error 是 AV.Error 的实例，包含有错误码和描述信息.
			  console.log('Failed to create new object, with error message: ' + err.message);
				callback.error(err);
			});
		}
	}, function(error) {
	  console.log('Error: ' + error.code + ' ' + error.message);
	});
}

	/*
	**查询公告数据
	**
	 */
// function getAnnounceData(){
//
// }


	/*
	**保存公告数据
	**Object
	*/
	// function saveAnnounceData(data,find,callback){
	// 	var post = AV.Object.new('Announce');
	// 	console.log(data);
	// 	var query = new AV.Query('Announce');
	// 	query.equalTo(find, data[find]);
	// 	query.find().then(function(results) {
	// 	  console.log('Successfully retrieved ' + results.length + ' posts.');
	// 	  // 处理返回的结果数据
	// 	  console.log(results.length);
	// 		if(results.length=="0"){
	// 			for(var key in data){
	// 				post.set(key, data[key]);
	// 			}
	// 			post.save().then(function(post) {
	// 			  // 成功保存之后，执行其他逻辑.
	// 			  console.log('New object created with objectId: ' + post.id);
	// 				callback.success(post);
	// 			}, function(err) {
	// 			  // 失败之后执行其他逻辑
	// 			  // error 是 AV.Error 的实例，包含有错误码和描述信息.
	// 			  console.log('Failed to create new object, with error message: ' + err.message);
	// 				callback.error(err);
	// 			});
	// 		}
	// 	}, function(error) {
	// 	  console.log('Error: ' + error.code + ' ' + error.message);
	// 	});


	// for(var key in data){
	// 	// console.log(data[key]);
	// 	post.set(key, data[key]);
	// }
	// post.save().then(function(post) {
	//   // 成功保存之后，执行其他逻辑.
	//   console.log('New object created with objectId: ' + post.id);
	// 	callback.success(post);
	// }, function(err) {
	//   // 失败之后执行其他逻辑
	//   // error 是 AV.Error 的实例，包含有错误码和描述信息.
	//   console.log('Failed to create new object, with error message: ' + err.message);
	// 	callback.error(err);
	// });
// }

function getUrlData(url,charset,callback){
	http.get(url, function(res) {
	    var source = "";
			res.setEncoding('binary');
	    res.on('data', function(data) {
	        source += data;
	    });
	    res.on('end', function() {
					var buf = new Buffer(source, 'binary');
					if(!charset){
						charset = "GBK";
					}
					var str = iconv.decode(buf, charset);
					callback.success(str);
	    });
	}).on('error', function() {
			callback.error("error");
	    console.log("获取数据出现错误");
	});
}

function getJWCImportentData(){
	getUrlData("http://www1.cuit.edu.cn/NewsList.asp?bm=32&type=448","GBK",{
		success:function(result){
			$ = cheerio.load(result);
			var time = '';
			var title = '';
			var url = '';
			var type = 'JWC';
			$(".newstext table td a").each(function(i, elem){
				if($(this).text()){
					if(i%2){
						//这里显示的是时间
						time = $(this).text();
						var data = {};
						data.time = time;
						data.title = title;
						data.url = url;
						data.type = type;
						saveAnnounceData(data,"title",{
							success:function(result){
								// console.log(result);
							},
							error:function(error){
								console.log(error)
							}
						});

					}else{
						//这里显示的是标题
						title = $(this).text();
						url = $(this).attr("href");
					}
				}
			})
		},
		error:function(error){
			console.log(error)
		}
	});
}
function getCUITImportentData(){
	console.log("测试");
	getUrlData("http://www.cuit.edu.cn/NewsList?id=2","UTF-8",{
		success:function(result){
			$ = cheerio.load(result);
			console.log(result);
			$("#NewsListContent li").each(function(i, elem){
				if($(this).text()){
						console.log($(this).children("a").text());
						var title = $(this).children("a").text();
						var url = "http://www.cuit.edu.cn/"+$(this).children("a").attr("href");
						var time = $(this).children(".datetime").text();
						var type = 'CUIT';
						time = time.replace("[","");
						time = time.replace("]","");
						var data = {};
						data.time = time;
						data.title = title;
						data.url = url;
						data.type = type;
						console.log(data);
						saveAnnounceData(data,"title",{
							success:function(result){
								console.log(result);
							},
							error:function(error){
								console.log(error)
							}
						});
				}
			})
		},
		error:function(error){
			console.log(error)
		}
	});
}

/*
**定时执行爬取学校公告信息
**
 */
 exports.cronGetData = function(){
	getCUITImportentData();
 	getJWCImportentData();
 }
function getCUITImportentDataByAV(){
	console.log("ok");
	AV.Cloud.httpRequest({
	  url: 'http://www.cuit.edu.cn/NewsList?id=2',
		headers: {
	    'Host':'www.cuit.edu.cn'
	  },
	  success: function(httpResponse) {
			console.log("success");
			console.log(httpResponse.text);
			$ = cheerio.load(httpResponse.text);
			$("#NewsListContent li").each(function(i, elem){
				if($(this).text()){
						console.log($(this).children("a").text());
						var title = $(this).children("a").text();
						var url = "http://www.cuit.edu.cn/"+$(this).children("a").attr("href");
						var time = $(this).children(".datetime").text();
						var type = 'CUIT';
						time = time.replace("[","");
						time = time.replace("]","");
						var data = {};
						data.time = time;
						data.title = title;
						data.url = url;
						data.type = type;
						console.log(data);
						saveAnnounceData(data,"title",{
							success:function(result){
								console.log(result);
							},
							error:function(error){
								console.log(error)
							}
						});
				}
			})
	  },
	  error: function(httpResponse) {
	    console.error('Request failed with response code ' + httpResponse.status);
	  }
	});
 }
 // getCUITImportentDataByAV();
 exports.getCUITImportentData = function(){
	 getCUITImportentDataByAV();
 }
 exports.getJWCImportentData = function(){
	getJWCImportentData();
 }

// getJWCImportentData();
// getCUITImportentDataByAV();

//初始化并设置定时任务的时间
// var rule = new schedule.RecurrenceRule();
// rule.second  = 5;

//处理要做的事情
// var j = schedule.scheduleJob(rule, function(){
//     getCUITImportentData();
// });


/*
**爬取正在上映电影
 */
 // function getMovieIngData(){
 // 	getUrlData("http://cd.nuomi.com/movie/","UTF-8",{
 // 		success:function(result){
 // 			$ = cheerio.load(result);
 // 			$(".level-item:nth-child(2) li").each(function(i, elem){
 // 			/*这里是百度糯米的正在上映的电影表单和相应的电影id和链接*/
 // 			// 	console.log($(this).children("a").text());
 // 			var url = $(this).children("a").attr("href");
 // 			var name = $(this).children("a").text();
 // 			var mid = $(this).children("a").attr("href").split("/")[4];
 // 			console.log(mid);
 // 			getPriceFromNM(mid);
 // 			})
 // 		},
 // 		error:function(error){
 // 			console.log(error)
 // 		}
 // 	});
 // }
 //
 function getMoviesData(){
 	getUrlData("http://cd.nuomi.com/pcindex/main/filmlist?type=1","UTF-8",{
 		success:function(result){
 			$ = cheerio.load(result);
			/*解析百度糯米正在上映和即将上演的电影*/
			console.log("正在上映");
 			$("#showing-movies-j .j-sliders .item").each(function(i, elem){
				/*这里是百度糯米正在上映的电影表单和相应的电影id和链接*/
 				var img = $(this).children("img").attr("src");
				var url = $(this).attr("href");
				var name = $(this).children("h5").text();
				var mid = $(this).attr("href").split("/")[2];
				var star = $(this).find(".star-cc").text().replace(/[\r\n]/g,"");
				console.log(name);
				var data = {};
				data.mid = mid;
				data.name = name;
				data.url = url;
				data.img = img;
				data.star = star;
				data.type = 'showing';
				saveMoviesData(data,"name",{
					success:function(result){
					},
					error:function(error){
						console.log(error)
					}
				});
				// getPriceFromNM(mid);
 			})
			console.log("即将上映");
			$("#upcoming-movies-j .j-sliders .item").each(function(i, elem){
				/*这里是百度糯米即将上映的电影表单和相应的电影id和链接*/
 				var img = $(this).children("img").attr("src");
				var url = $(this).attr("href");
				var name = $(this).children("h5").text();
				var mid = $(this).attr("href").split("/")[2];
				var releaseDate = $(this).children(".release-date").text();
				var star = $(this).find(".star-cc").text().replace(/[\r\n]/g,"");
				console.log(releaseDate);
				var data = {};
				data.mid = mid;
				data.name = name;
				data.url = url;
				data.img = img;
				data.star = star;
				data.releaseDate = releaseDate;
				data.type = 'upcoming';
				saveMoviesData(data,"name",{
					success:function(result){
						// console.log(result);
					},
					error:function(error){
						console.log(error)
					}
				});
				// getPriceFromNM(mid);
 			})
 		},
 		error:function(error){
 			console.log(error)
 		}
 	});
 }

 function getMovieIngData(mid,type,callback){
	 getUrlData("http://m.dianying.baidu.com/info/cinema/detail?cinemaId=3185&sfrom=newnuomi&from=webapp&sub_channel=nuomi_wap_rukou5&source=nuomi&c=75&cc=&kehuduan=#showing","UTF-8",{
		 success:function(result){
			 $ = cheerio.load(result);
		 /*解析百度糯米正在上映和即将上演的电影*/
		 console.log("正在上映");
			var data = {};
			data = result.split("_MOVIE.data =")[1];
			data = data.split("};")[0];
			data = data + '};';
			// data = eval("("+data+")");
			// data = JSON.stringify(data);
			// data = JSON.parse(data);
			data = eval("data="+data);
			// console.log(data.movies);
			for(var i = 0; i < data.movies.length;i++){
				if(data.movies[i].movieId == mid){
					for(var j = 0; j < data.movies[i].schedules.length; j++){
						/**************解析每天的电影场次****************/
						// console.log(data.movies[i]);
						// for(var k = 0; k <  data.movies[i].schedules[k].dailySchedules)

						/*****************返回某个电影的上映时间和价格*****************/
						if(type == "simple"){

						}else{
							callback.success(data.movies[i].schedules[j].dailySchedules);
						}
					}
				}
			}
		 },
		 error:function(error){
			 console.log(error)
		 }
	 });
 }

 function getPriceFromNM(mid){
	 var cinemaid = '2a70b03e63fdb05e774ff173';
	 var mid = mid;
	 var needMovieInfo = '1';
	 var tploption = '1';
	 AV.Cloud.httpRequest({
	  method: 'GET',
	  url: 'http://cd.nuomi.com/pcindex/main/timetable?cinemaid='+cinemaid+'&mid='+mid+'&needMovieInfo='+needMovieInfo+'&tploption='+tploption,
	  headers: {
	    'Content-Type': 'application/json'
	  },
	  success: function(httpResponse) {
	    // console.log(httpResponse.text);
			var result = httpResponse.text;
			$ = cheerio.load(result);
			var movieName = $(".content h2 a").text();
			console.log(movieName);
			/***********这里解析日期***********/
			$("#j-movie-date dd").each(function(i,ele){
				var id = $(this).children("a").attr("href").split("#")[1];
				var date = $(this).children("a").text();
				console.log(id);
				console.log(date);
				$("#"+id+" .table tr").each(function(i,ele){
					console.log($(this).children("td").first().text());
					console.log($(this).find(".nuomi-price").text());
					console.log(i);
				})
			})
			// $(".table tr").each(function(i,ele){
			// 	console.log($(this).children("td").first().text());
			// 	console.log($(this).find(".nuomi-price").text());
			// 	console.log(i);
			// })
	  },
	  error: function(httpResponse) {
	    console.error('Request failed with response code ' + httpResponse.status);
	  }
	});
 }
// getPriceFromNM(9889);
// getMovieIngData();
// getMoviesData();
getMovieIngData(9932,"",{
	success:function(){

	},
	error:function(){

	}
})

app.get('/announce', function(req, res) {
		var query = new AV.Query('Announce');
		query.addDescending('time');
		query.find().then(function(results) {
			// 处理返回的结果数据
			console.log(results);
			res.render('announce', {results:results});
		}, function(error) {
			console.log('Error: ' + error.code + ' ' + error.message);
			res.render('announce', {results:error});
		});
});

app.get('/', function(req, res) {
	res.render('test', {});
});

app.get('/test', function(req, res) {
  res.render('test', {});
});

app.get('/movie', function(req, res) {
	var query = new AV.Query('Movies');
	query.addDescending('star');
	query.find().then(function(results) {
		// 处理返回的结果数据
		console.log(results);
		res.render('movie', {results:results});
	}, function(error) {
		console.log('Error: ' + error.code + ' ' + error.message);
		res.render('movie', {results:error});
	});
  // res.render('movie', {});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();

// module.exports = app;
