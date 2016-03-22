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

//调用发送邮件功能
var nodemailer = require("nodemailer");

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
	//  getUrlData("http://m.dianying.baidu.com/info/cinema/detail?cinemaId=3185&sfrom=newnuomi&from=webapp&sub_channel=nuomi_wap_rukou5&source=nuomi&c=75&cc=&kehuduan=","UTF-8",{
	// 	 success:function(result){
	AV.Cloud.httpRequest({
	  url: 'http://m.dianying.baidu.com/info/cinema/detail?cinemaId=3185&sfrom=newnuomi&from=webapp&sub_channel=nuomi_wap_rukou5&source=nuomi&c=75&cc=&kehuduan=',
		headers: {
			"Cookie":"NODE_SESSION_ID=s%3AV8VjXqWeayQGSV3kcM6Q22DKMGNJ3qyM.Sx%2FtYuIb6m4a5vG3e3gktHew8Ma%2BOwk%2FbO0D4PxF0tc; PSTM=1458534490; BIDUPSID=C3F3534CB5EDC0087A3072890F659C05; H_PS_PSSID=18285_1465_18282_18205_17000_15123_11652_10634; plus_cv=nav:23386ac1-hotword:3f061d97; plus_lsv=149e561a711635f2navStyleOpt1; H_WISE_SIDS=103995_102279_100038_102433_104028_101977_100099_103641_102171_104179_103717_104212_103642_103999_104004_103280_900806_100457; BAIDUID=C3F3534CB5EDC0087A3072890F659C05:FG=1; BDUSS=1pJSTltUU1zVjF3dGFtclpwUmlHd3J5azhjSHk3bzhkLWV0fnFGd0R6S1BhaGRYQVFBQUFBJCQAAAAAAAAAAAEAAAAOYiUxcmRxNTIwNTY3AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI~d71aP3e9Wa; Hm_lvt_f931be9fb5640ecfedb2af6fe48f3944=1458560215,1458560355,1458560414,1458560417; Hm_lpvt_f931be9fb5640ecfedb2af6fe48f3944=1458560417",
			"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	    'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
	  },
	  success: function(httpResponse) {
			var result = httpResponse.text;
			$ = cheerio.load(result);
		 /*解析百度糯米正在上映和即将上演的电影*/
		 console.log("正在上映");
		//  console.log(result);
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
					console.log(data.movies[i].name);
					console.log(data.movies[i].schedules);
					callback.success(data.movies[i].schedules);
					for(var j = 0; j < data.movies[i].schedules.length; j++){
						/*****************返回某个电影的上映时间和价格*****************/
						// callback.success(data.movies[i].schedules[j].dailySchedules);
					}
				}else if(!mid){
					console.log(data.movies[i].name);
					for(var j = 0; j < data.movies[i].schedules.length; j++){
							/**************解析所有的电影场次****************/
							// console.log(data.movies[i].schedules[j]);
							console.log(data.movies[i].schedules[j].dateText);
							for(var k = 0; k <  data.movies[i].schedules[j].dailySchedules.length;k++){
								// console.log(data.movies[i].schedules[j].dailySchedules[k]);
								var star = data.movies[i].schedules[j].dailySchedules[k].star;
								var end = data.movies[i].schedules[j].dailySchedules[k].end;
								var price = data.movies[i].schedules[j].dailySchedules[k].price;
								console.log(price);
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

// getMovieIngData(9932,"",{
// 	success:function(result){
// 		console.log(result);
// 	},
// 	error:function(error){
// 		console.log(error);
// 	}
// })
//

function getMovieDetailFromNM(mid,callback){
	var mid = mid;
	AV.Cloud.httpRequest({
	 method: 'GET',
	 url: 'http://m.dianying.baidu.com/info/movie/detail?movie_id='+mid+'&sfrom=newnuomi&from=webapp&sub_channel=nuomi_wap_rukou5&source=nuomi&c=75&cc=&kehuduan=',
	 success: function(httpResponse) {
		 // console.log(httpResponse.text);
		 var result = httpResponse.text;
		 $ = cheerio.load(result);
		//  console.log(result);
		 /***********这里解析日期***********/
		 var movieDetail = {};
		 movieDetail.img = $(".poster").attr("src");
		 movieDetail.name = $(".list-name").text();
		 movieDetail.star = $(".score-normal").text();
		 var detail = {};
		 var cast = {};
		 $(".detail-info .detail").each(function(i,ele){
			//  console.log($(this).text().replace(/[ ]/g,"").replace(/(\n)+|(\r\n)+/g, ""));
			//  detail[i] =  $(this).text().replace(/[ ]/g,"").replace(/(\n)+|(\r\n)+/g, "");
			//  console.log($(this).children(".th").text());
			//  console.log($(this).children(".td").text());
				var text = $(this).text().replace(/[ ]/g,"").replace(/(\n)+|(\r\n)+/g, "");
				if(i == 0){
					detail["介绍"] = text.split(":")[0];
				}else{
					detail[text.split(":")[0]] = text.split(":")[1];
				}
			})
			console.log(detail);
			movieDetail.detail = detail;
		 $(".cast .tr").each(function(i,ele){
			 var th = $(this).children(".th").text();
			 var td = $(this).children(".td").text();
			//  console.log($(this).text().replace(/[ ]/g,"").replace(/(\n)+|(\r\n)+/g, ""));
			//  cast[i] = $(this).text().replace(/[ ]/g,"").replace(/(\n)+|(\r\n)+/g, "");
				cast[th] = td;
			})
			movieDetail.cast = cast;
			console.log(movieDetail);
			callback.success(movieDetail);
			// console.log($(".cast").)
	 },
	 error: function(httpResponse) {
		 console.error('Request failed with response code ' + httpResponse.status);
	 }
 });
}

/**********************发送邮件****************************/
function sendEmail(to,movie,platform){
	//这里是初始化，需要定义发送的协议，还有你的服务邮箱，当然包括密码了
	var smtpTransport = nodemailer.createTransport("SMTP",{
	    service: "Gmail",
	    auth: {
	        user: "raodaqi@gmail.com",
	        pass: "rdq951019"
	    }
	});
	//邮件配置，发送一下 unicode 符合的内容试试！
	var mailOptions = {
	    from: "raodaqi@gmail.com",       // 发送地址
	    // to: "bar@blurdybloop.com, baz@blurdybloop.com", // 接收列表
	    to: "598471284@qq.com,260940356@qq.com",
	    subject: "您关注的电影疯狂动物城在百度糯米上价格低于您设置的价格  ",                             // 邮件主题
	    text: "快去糯米上购买吧。祝你观影愉快",                          // 文本内容
	    html: ""                    // html内容
	}
	//开始发送邮件
	smtpTransport.sendMail(mailOptions, function(error, response){
	    if(error){
	        console.log(error);
	    }else{
	        console.log("邮件已经发送: " + response.message);
	    }
	    //如果还需要实用其他的 smtp 协议，可将当前回话关闭
	    //smtpTransport.close();
	});
}


// getMovieDetailFromNM("9932");
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

app.get('/detail/:id', function(req, res) {
	var id = req.params.id;
	console.log(id);
	if(id){
		// getMovieIngData(id,"",{
		// 	success:function(price){
		// 		console.log(price);
				getMovieDetailFromNM(id,{
					success:function(movieDetail){
						// console.log(result);
						res.render('detail', {movieDetail:movieDetail,id:id});
					},
					error:function(error){
						console.log(error);
						res.render('detail', {movieDetail:''});
					}
				})
		// 	},
		// 	error:function(error){
		// 		console.log(error);
		// 	}
		// })
	}else{
		res.render('detail', {movieDetail:""});
	}
});
app.post('/price', function(req, res) {
	var id = req.body.id;
	console.log(id);
	getMovieIngData(id,"",{
		success:function(price){
			console.log(price);
			res.send(price);
		},
		error:function(error){
			console.log(error);
			// res.send(error);
		}
	})
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
