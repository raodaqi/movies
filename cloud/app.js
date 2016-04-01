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
function saveMoviesData(data,find,type,callback){
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
		}else{
			if(type == 'BJ'){
				console.log(results[0].id);
				query.get(results[0].id).then(function(post) {
					// 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
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
				}, function(error) {
					// 失败了
					console.log(error);
				});
			}
		}


			// if(type == 'BJ'){
			// 	for(var key in data){
			// 		post.set(key, data[key]);
			// 	}
			// 	post.save().then(function(post) {
			// 	  // 成功保存之后，执行其他逻辑.
			// 	  console.log('New object created with objectId: ' + post.id);
			// 		callback.success("success");
			// 	}, function(err) {
			// 	  // 失败之后执行其他逻辑
			// 	  // error 是 AV.Error 的实例，包含有错误码和描述信息.
			// 	  console.log('Failed to create new object, with error message: ' + err.message);
			// 		callback.error(err);
			// 	});
			// }
	}, function(error) {
	  console.log('Error: ' + error.code + ' ' + error.message);
	});
}
// saveMoviesData({'name':'破风'},'name');
// return 0;
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
				saveMoviesData(data,"name","",{
					success:function(result){
					},
					error:function(error){
						console.log(error)
					}
				});
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
				saveMoviesData(data,"name","",{
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
 //爬取糯米网上成都耀莱电影院的电影
 function getMoviePageFromNMData(){
	 AV.Cloud.httpRequest({
		url: 'http://cd.nuomi.com/pcindex/main/timetable?cinemaid=2a70b03e63fdb05e774ff173&mid=9738&needMovieInfo=1&tploption=1',
		headers: {
		},
		success: function(httpResponse) {
			console.log("success");
		 console.log(httpResponse.text);
			var BJData = eval("BJData="+httpResponse.text);
			console.log(BJData);
			for(var i = 0; i < BJData.results.length;i++){
				var data = {};
				data.bid = BJData.results[i].id;
				data.name = BJData.results[i].title;
				data.poster = BJData.results[i].poster;
				data.poster_big = BJData.results[i].poster_big;
				data.vertical_poster = BJData.results[i].vertical_poster;
				data.type = 'showing';
				saveMoviesData(data,"name","BJ",{
					success:function(result){
					},
					error:function(error){
						console.log(error)
					}
				});
			}
		},
		error: function(httpResponse) {
			console.error('Request failed with response code ' + httpResponse.status);
		}
	});
 }

 function getMoviesFromMYData(){
	 AV.Cloud.httpRequest({
 	  url: 'http://m.maoyan.com/movie/list.json?type=hot&offset=0&limit=1000',
 		headers: {
 	  },
 	  success: function(httpResponse) {
 			console.log("success");
 		// 	console.log(httpResponse.text);
			var MYData = eval("MYData="+httpResponse.text);
			console.log(MYData);
 	  },
 	  error: function(httpResponse) {
 	    console.error('Request failed with response code ' + httpResponse.status);
 	  }
 	});
 }

 // getMoviesFromMYData();

/**********************从比价网上面爬取到的数据********************************************/
/*********************************爬取价格**********************************/
 function getPriceFromBJData(movie,cinema,date,callback){
 	AV.Cloud.httpRequest({
 // 	 url: 'http://www.xuerendianying.com/bijia_api/fs/filmsessionlist/?movie=326929&cinema=4838&date=2016-03-25',
 	 url: 'http://www.xuerendianying.com/bijia_api/fs/filmsessionlist/?movie='+movie+'&cinema='+cinema+'&date='+date,
 	 headers: {
 	 },
 	 success: function(httpResponse) {
 		 console.log("success");
		//  console.log(httpResponse.text);
 		 var BJData = eval("BJData="+httpResponse.text);
		 var priceData = {};
 		 console.log(BJData);
		 var minData = BJData.filmsession_list[0];
		 priceData.name = BJData.movie.title;
		 if(BJData.filmsession_list.length){
			 var minPrice = BJData.filmsession_list[0]['min_price'];
			 for(var i = 0; i < BJData.filmsession_list.length;i++){
				 if(minPrice > BJData.filmsession_list[i]['min_price']){
					 minPrice = BJData.filmsession_list[i]['min_price'];
					 minData = BJData.filmsession_list[i];
				 }
			 }
			 priceData.price = minPrice;
			 priceData.showtime = minData.showtime;
			 var nameList = {};
			for(var i = 0; i < minData.channel_list.length; i++){
				var name = minData.channel_list[i].name;
				var price = minData.channel_list[i].price;
				if(price == minPrice){
					nameList[i] = minData.channel_list[i].name;
				 //  console.log(minData.channel_list[i].name);
				}
			}
			priceData.nameList = nameList;
		 }else{

		 }
		//  priceData.price = minPrice;
		//  priceData.showtime = minData.showtime;
		//  console.log(minData);
		//  var nameList = {};
		//  for(var i = 0; i < minData.channel_list.length; i++){
		// 	 var name = minData.channel_list[i].name;
		// 	 var price = minData.channel_list[i].price;
		// 	 if(price == minPrice){
		// 		 nameList[i] = minData.channel_list[i].name;
		// 		//  console.log(minData.channel_list[i].name);
		// 	 }
		//  }
		//  priceData.nameList = nameList;
		//  console.log(priceData);
		 callback.success(priceData);
 	 },
 	 error: function(httpResponse) {
 		 console.error('Request failed with response code ' + httpResponse.status);
		 callback.error(httpResponse);
 	 }
  });
 }
 // getPriceFromBJData('326929','4838','2016-03-31',{
 //  success:function(result){
 // 	 console.log(result);
 //  }
 // });
 /*********************************爬取正在上映的电影**********************************/
  function getMoviePage1FromBJData(){
  	AV.Cloud.httpRequest({
  	 url: 'http://www.xuerendianying.com/bijia_api/fs/movielist/?cityid=880&page=1',
  	 headers: {
  	 },
  	 success: function(httpResponse) {
  		 console.log("success");
 		 	console.log(httpResponse.text);
  		 var BJData = eval("BJData="+httpResponse.text);
  		 console.log(BJData);
			 for(var i = 0; i < BJData.results.length;i++){
				 var data = {};
				 data.bid = BJData.results[i].id;
				 data.name = BJData.results[i].title;
				 data.poster = BJData.results[i].poster;
				 data.poster_big = BJData.results[i].poster_big;
				 data.vertical_poster = BJData.results[i].vertical_poster;
				 data.type = 'showing';
				 saveMoviesData(data,"name","BJ",{
					 success:function(result){
					 },
					 error:function(error){
						 console.log(error)
					 }
				 });
			 }
  	 },
  	 error: function(httpResponse) {
  		 console.error('Request failed with response code ' + httpResponse.status);
  	 }
   });
  }
	// getMoviePage1FromBJData();

	function getMoviePage2FromBJData(){
  	AV.Cloud.httpRequest({
  	 url: 'http://www.xuerendianying.com/bijia_api/fs/movielist/?cityid=880&page=2',
  	 headers: {
  	 },
  	 success: function(httpResponse) {
  		 console.log("success");
 		//  	console.log(httpResponse.text);
  		 var BJData = eval("BJData="+httpResponse.text);
  		 console.log(BJData);
			 for(var i = 0; i < BJData.results.length;i++){
				 var data = {};
				 data.bid = BJData.results[i].id;
				 data.name = BJData.results[i].title;
				 data.poster = BJData.results[i].poster;
				 data.poster_big = BJData.results[i].poster_big;
				 data.vertical_poster = BJData.results[i].vertical_poster;
				 data.type = 'showing';
				 saveMoviesData(data,"name","BJ",{
					 success:function(result){
					 },
					 error:function(error){
						 console.log(error)
					 }
				 });
			 }
  	 },
  	 error: function(httpResponse) {
  		 console.error('Request failed with response code ' + httpResponse.status);
  	 }
   });
  }
	function getMoviePage3FromBJData(){
  	AV.Cloud.httpRequest({
  	 url: 'http://www.xuerendianying.com/bijia_api/fs/movielist/?cityid=880&page=3',
  	 headers: {
  	 },
  	 success: function(httpResponse) {
  		 console.log("success");
 		//  	console.log(httpResponse.text);
  		 var BJData = eval("BJData="+httpResponse.text);
  		 console.log(BJData);
			 for(var i = 0; i < BJData.results.length;i++){
				 var data = {};
				 data.bid = BJData.results[i].id;
				 data.name = BJData.results[i].title;
				 data.poster = BJData.results[i].poster;
				 data.poster_big = BJData.results[i].poster_big;
				 data.vertical_poster = BJData.results[i].vertical_poster;
				 data.type = 'showing';
				 saveMoviesData(data,"name","BJ",{
					 success:function(result){
					 },
					 error:function(error){
						 console.log(error)
					 }
				 });
			 }
  	 },
  	 error: function(httpResponse) {
  		 console.error('Request failed with response code ' + httpResponse.status);
  	 }
   });
  }
	/*********************************爬取所在城市**********************************/
   function getMovieAddFromBJData(){
   	AV.Cloud.httpRequest({
   	 url: 'http://www.xuerendianying.com/bijia_api/fs/cinemalist/?cityid=880&lon=103.991905&lat=30.586432',
   	 headers: {
   	 },
   	 success: function(httpResponse) {
   		 console.log("success");
  		//  	console.log(httpResponse.text);
   		 var BJData = eval("BJData="+httpResponse.text);
   		 console.log(BJData);
   	 },
   	 error: function(httpResponse) {
   		 console.error('Request failed with response code ' + httpResponse.status);
   	 }
    });
   }

   /************************************通知*****************************************************/
	 function formatDate (format,timestamp,full) {
        format = format.toLowerCase();
        if(!format) format = "y-m-d h:i:s";
        function zeroFull(str){
            // console.log(full);
            // return full ? (str >= 10 ? str : ('0' + str)) : str;
            return (str >= 10 ? str : ('0' + str));
        }
        var time = new Date(timestamp),o = {
            y : time.getFullYear(),
            m : zeroFull(time.getMonth() + 1),
            d : zeroFull(time.getDate()),
            h : zeroFull(time.getHours()),
            i : zeroFull(time.getMinutes()),
            s : zeroFull(time.getSeconds())
        };
        return format.replace(/([a-z])(\1)*/ig,function(m){
            return o[m];
        });
    };
	 function getBJId(name,callback){
		 var query = new AV.Query('Movies');
		 query.equalTo('name', name);
		 query.first().then(function(results) {
			 // 处理返回的结果数据
			 console.log(results);
			 callback.success(results);
		 }, function(error) {
			 console.log('Error: ' + error.code + ' ' + error.message);
			 callback.error(results);
		 });
	 }
	//  sendLowPriceEmail();
	 function sendEmailContent(data,i){
		 getPriceFromBJData(bid,'4838',date,{
			 success:function(result){
				//  console.log(result);
				 var minPrice = result.price;
				 console.log(minPrice);
				 if(minPrice <= price){
					 var email = object.attributes.email;
					 ifSendEmail(email,result.name,minPrice,date,{
						 success:function(successLog){
							 console.log(successLog.code);
							 // sendEmail(email,result.name,result.nameList[0]);
							 if(successLog.code){
								 console.log("发送邮件");
								 sendEmail(email,result.name,result.nameList[0]);
							 }else{
								 console.log("邮箱已发送过");
							 }
						 },
						 error:function(error){
							 console.log(error);
						 }
					 })
					 // sendEmail(email,result.name,result.nameList[0]);
				 }
			 },
			 error:function(error){
				 console.log(error);
			 }
		 })
	 }
	//  sendLowPriceEmail();
	 function sendEmailContent(object){
		 getBJId(object.attributes.name,{
			 success:function(result){
				 var bid = result.attributes.bid;
				 var price = object.attributes.price;
				 var name = object.attributes.name;
				 var date = new Date().getTime();
				 date = formatDate("y-m-d",date);
				 console.log("name:"+name+" "+"bid:"+bid+" "+"price:"+price);
				//  return;
				 if(bid){
					 getPriceFromBJData(bid,'4838',date,{
						 success:function(result){
							 console.log(result);
							 var minPrice = result.price;
							 if(!minPrice){
								 minPrice = 70;
							 }
							 console.log(minPrice);
							 if(minPrice <= price){
								 var email = object.attributes.email;
								 ifSendEmail(email,result.name,minPrice,date,{
									 success:function(successLog){
										 console.log(successLog.code);
										 // sendEmail(email,result.name,result.nameList[0]);
										 if(successLog.code){
											 console.log("发送邮件");
											 sendEmail(email,result.name,result.nameList[0]);
										 }else{
											 console.log("邮箱已发送过");
										 }
									 },
									 error:function(error){
										 console.log(error);
									 }
								 })
								 // sendEmail(email,result.name,result.nameList[0]);
							 }
						 },
						 error:function(error){
							 console.log("失败2");
							 sendLowPriceEmail();
						 }
					 })
				 }
				 console.log(result.attributes.bid);
				 // getPriceFromBJData('326929','4838','2016-03-28');
			 },
			 error:function(error){
				 console.log("失败1");
				 sendLowPriceEmail();
			 }
		 });
	 }
   function sendLowPriceEmail(){
		 	var query = new AV.Query('Attention');
			query.find().then(function(results) {
			  console.log('Successfully retrieved ' + results.length + ' posts.');
			  // 处理返回的结果数据
			  for (var i = 0; i < results.length; i++) {
			    var object = results[i];
			    // console.log(object);
			    sendEmailContent(object);
					// return ;
					// continue;
					// getBJId(object.attributes.name,{
					// 	success:function(result){
					// 		var bid = result.attributes.bid;
					// 		var price = object.attributes.price;
					// 		var date = new Date().getTime();
					// 		date = formatDate("y-m-d",date);
					// 		console.log("date:"+date+" "+"bid:"+bid+" "+"price:"+price);
					// 		return;
					// 		if(bid){
					// 			getPriceFromBJData(bid,'4838',date,{
					// 				success:function(result){
					// 					console.log(result);
					// 					var minPrice = result.price;
					// 					console.log(minPrice);
					// 					if(minPrice <= price){
					// 						var email = object.attributes.email;
					// 						ifSendEmail(email,result.name,minPrice,date,{
					// 							success:function(successLog){
					// 								console.log(successLog.code);
					// 								// sendEmail(email,result.name,result.nameList[0]);
					// 								if(successLog.code){
					// 									console.log("发送邮件");
					// 									sendEmail(email,result.name,result.nameList[0]);
					// 								}else{
					// 									console.log("邮箱已发送过");
					// 								}
					// 							},
					// 							error:function(error){
					// 								console.log(error);
					// 							}
					// 						})
					// 						// sendEmail(email,result.name,result.nameList[0]);
					// 					}
					// 				},
					// 				error:function(error){
					// 					console.log(error);
					// 				}
					// 			})
					// 		}
					// 		console.log(result.attributes.bid);
					// 		// getPriceFromBJData('326929','4838','2016-03-28');
					// 	},
					// 	error:function(error){
					// 		console.log(error);
					// 	}
					// });
			  }
			}, function(error) {
			  console.log('Error: ' + error.code + ' ' + error.message);
			});
   }

	 function ifSendEmail(email,movie,price,date,callback){
			var query = new AV.Query('SendLog');
			query.equalTo('email', email);
			query.equalTo('movie', movie);
			query.equalTo('price', price);
			query.equalTo('date', date);
			query.find().then(function(results) {
			  // 处理返回的结果数据
			  var Post = AV.Object.extend('SendLog');
				console.log(results.length);
				if(results.length){
					callback.success({code:0});
					var query = new AV.Query(Post);
					// 这个 id 是要修改条目的 objectId，你在生成这个实例并成功保存时可以获取到，请看前面的文档
					query.get(results.id).then(function(post) {
					  // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
					  post.set('email',email);
						post.set('movie',movie);
						post.set('price',price);
						post.set('date',date);
					  post.save().then(function(post) {
						  // 成功保存之后，执行其他逻辑.
						  // res.send(post);
						  console.log("更新成功");
						  console.log('New object created with objectId: ' + post.id);
						}, function(err) {
						  // 失败之后执行其他逻辑
						  // error 是 AV.Error 的实例，包含有错误码和描述信息.
						  res.send(err);
						  console.log('Failed to create new object, with error message: ' + err.message);
						});
					}, function(error) {
					  // 失败了
					});
				}else{
					var post = new Post();
					post.set('email',email);
					post.set('movie',movie);
					post.set('price',price);
					post.set('date',date);
					post.save().then(function(post) {
					  // 成功保存之后，执行其他逻辑.
					  console.log('New object created with objectId: ' + post.id);
						console.log("保存成功");
						callback.success({code:1});
					}, function(err) {
					  // 失败之后执行其他逻辑
					  // error 是 AV.Error 的实例，包含有错误码和描述信息.
					  console.log('Failed to create new object, with error message: ' + err.message);
					});
				}
			}, function(error) {
				callback.error(error);
			  console.log('Error: ' + error.code + ' ' + error.message);
			});
	 }
	//  sendLowPriceEmail();

// getPriceFromBJData();

 // function getMYPriceData(myid,type,callback){
 //  var cinemaid = 7990;
 //  AV.Cloud.httpRequest({
 // 	  url: 'http://m.maoyan.com/showtime/wrap.json?cinemaid='+cinemaid+'&movieid='+myid,
 // 	success: function(httpResponse) {
 // 		console.log(httpResponse.text);
 // 	},
 // 	error: function(error){
 // 	}
 // 	})
 // }
 function getMYPriceData(myid){
	 var cinemaid = 7990;
	 AV.Cloud.httpRequest({
		method: 'GET',
 	  url: 'http://m.maoyan.com/showtime/wrap.json?cinemaid='+cinemaid+'&movieid='+myid,
 		headers: {
			'Host':'m.maoyan.com',
			'Referer':'http://m.maoyan.com/',
			'Content-Type':'text/html;charset=UTF-8',
			'X-Requested-With':'XMLHttpRequest',
			'Connection':'keep-alive',
			'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
 	  },
 	 //  url:'http://api.meituan.com/show/v2/movies/shows.json?cinema_id='+cinemaid+'&channelId=1&business=1&clientType=android&__vhost=api.maoyan.com&utm_campaign=AmovieBmovieCD-1&movieBundleVersion=6601&utm_source=wandoujia&utm_medium=android&utm_term=6.6.0&utm_content=353347060150990&ci=59&net=255&dModel=XT1085&uuid=3382AC16F9DBDFA2285776CED95D3664C0F4D219999032F262F4FC885EF4A6AE&lat=30.580526&lng=103.984982&__skck=6a375bce8c66a0dc293860dfa83833ef&__skts=1458710896843&__skua=7e01cf8dd30a179800a7a93979b430b2&__skno=fd95f55a-6a25-4094-a1d0-9cbfee42dde8&__skcy=1aIZuZAPR7Dks4bOy0OTk91yucA%3D',
	//  headers: {
	// 	 'User-Agent':'AiMovie /motorola-6.0.1-cm_victara_retcn-1776x1080-480-6.6.0-6601-353347060150990-wandoujia',
	// 	 'Host':'api.meituan.com',
	// 	 'Accept-Encoding': 'gzip',
	// 	 'key':'52628410',
	// 	 'Date':'Wed Mar 23 2016 05:36:27 GMT',
	// 	 'Authorization': 'cb393eb37cc15ae5ec7ffd20fffdae33',
	// 	 '__skua': '7e01cf8dd30a179800a7a93979b430b2',
	// 		'__skts': '1458711387926',
	// 		'__skck': '6a375bce8c66a0dc293860dfa83833ef',
	// 		'__skcy': 'ZaFkfczbEEnKsH2qTF85W/9GduQ=',
	// 		'__skno': 'c9c949c1-d02f-48df-b407-a9bc3a789971',
	// 	 'Accept-Charset': 'utf-8',
	// 	 'Connection': 'Keep-Alive'
	//  },
 	  success: function(httpResponse) {
 			console.log("success");
 		// 	console.log(httpResponse.text);
			var MYData = eval("MYData="+httpResponse.text);
			console.log(MYData.data.DateShow);
 	  },
 	  error: function(httpResponse) {
 	    console.error('Request failed with response code ' + httpResponse.status);
 	  }
 	});
 }
// getMYPriceData(247220);


function getTBPriceData(callback){
	var cinemaid = 7990;
	AV.Cloud.httpRequest({
	 method: 'GET',
	 url: 'http://api.m.taobao.com/h5/mtop.film.mtopcinemaapi.getcinema/5.4/?v=5.4&api=mtop.film.MtopCinemaAPI.getCinema&appKey=12574478&t=1458749725407&callback=mtopjsonp1&type=jsonp&sign=ec846d287f97d533f0ec377a27d28a71&data=%7B%22platform%22%3A%228%22%2C%22asac%22%3A%22D679AU6J95PHQT67G0B5%22%2C%22cinemaId%22%3A%2218978%22%7D',
	 // url:'http://h5.m.taobao.com/app/movie/pages/index/show-list.html?_=_&from=def&sqm=a1z2r.7661912.1.1&cinemaid=18978&cinemaname=%E6%88%90%E9%83%BD%E8%80%80%E8%8E%B1%E6%88%90%E9%BE%99%E5%9B%BD%E9%99%85%E5%BD%B1%E5%9F%8E&spm=a1z2r.7661912.h5_movie_index.10',
	 headers: {
		 'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		 'Cookie':'cna=1aV2Drs7QE8CAd4Sfzas2Iw8; v=0; cookie2=1c63f24d36b4f682442da82104824b89; t=2c8f328a46538d455cd07e86425fef67; _m_h5_tk=ceb6fcd77c11f2b1dffcf8c495ffe3ff_1458753907787; _m_h5_tk_enc=46c05b8b7e707d3f74a101ca659c595d; isg=39312BA330D24BACB637C34D391FB934; l=Aj4-R2jwjyAhSmbNGLcMAxIEDk-AYQL5',
		 'Host':'api.m.taobao.com',
		 'Referer':'http://h5.m.taobao.com/app/movie/pages/index/show-list.html?_=_&from=def&sqm=a1z2r.7661912.1.1&cinemaid=18978&cinemaname=%E6%88%90%E9%83%BD%E8%80%80%E8%8E%B1%E6%88%90%E9%BE%99%E5%9B%BD%E9%99%85%E5%BD%B1%E5%9F%8E&spm=a1z2r.7661912.h5_movie_index.9'
	 },
	 success: function(httpResponse) {
		 console.log("success");
		//  var TBData = eval('('+httpResponse.text+')');
		var TBData = httpResponse.text.split("mtopjsonp1(")[1];
		TBData = TBData.substring(0,TBData.length-1);
		TBData = eval("TBData="+TBData);
		 console.log(TBData.data.returnValue.shows);
		 /*******************这里的价格是3600 = 36****************************/
		 callback.success(TBData.data.returnValue.shows);
	 },
	 error: function(httpResponse) {
		 console.error('Request failed with response code ' + httpResponse.status);
	 }
 });
}
// getTBPriceData();


 function getMovieIngData(mid,type,callback){
	//  getUrlData("http://m.dianying.baidu.com/info/cinema/detail?cinemaId=3185&sfrom=newnuomi&from=webapp&sub_channel=nuomi_wap_rukou5&source=nuomi&c=75&cc=&kehuduan=","UTF-8",{
	// 	 success:function(result){
	AV.Cloud.httpRequest({
	  url: 'http://m.dianying.baidu.com/info/cinema/detail?cinemaId=3185&sfrom=newnuomi&from=webapp&sub_channel=nuomi_wap_rukou5&source=nuomi&c=75&cc=&kehuduan=',
		headers: {
			"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	    'User-Agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
	  },
	  success: function(httpResponse) {
			var result = httpResponse.text;
			$ = cheerio.load(result);
		 /*解析百度糯米正在上映和即将上演的电影*/
		 console.log(result);
		//  return;
		//  console.log(result);
			var data = {};
			data = result.split("_MOVIE.data =")[1];
			data = data.split("};")[0];
			data = data + '};';
			// data = eval("("+data+")");
			// data = JSON.stringify(data);
			// data = JSON.parse(data);
			data = eval("data="+data);
			if(type == "NMYL"){
				var movieData = [];
				for(var i = 0; i < data.movies.length;i++){
					movieData[i] = {
						"name":data.movies[i].name,
						"releaseDate":data.movies[i].releaseDate
					}
				}
				callback.success(movieData);
				return;
			}
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

function saveYLMovie(data,callback){
	var query = new AV.Query('Movies');
	query.equalTo('name', data.name);
	query.find().then(function(results) {
		console.log('Successfully retrieved ' + results.length + ' posts.');
		// 处理返回的结果数据
		for (var j = 0; j < results.length; j++) {
			var object = results[j];
			console.log(data.releaseDate);
			// return;
			if(j == 0){
				// 这个 id 是要修改条目的 objectId，你在生成这个实例并成功保存时可以获取到，请看前面的文档
				query.get(object.id).then(function(post) {
					// 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
					post.set('add', 'YL');
					post.set('releaseDate', data.releaseDate);
					post.save().then(function() {
						// 保存成功
						console.log("更新成功");
					}, function(error) {
						// 失败
						console.log("更新失败");
					});
				}, function(error) {
					// 失败了
				});
			}else{
				query.get(object.id).then(function(post) {
					// 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
					post.destroy().then(function() {
					  // 删除成功
					  console.log("删除成功");
					}, function(error) {
					  // 失败
					  console.log("删除失败");
					});
				}, function(error) {
					// 失败了
				});
			}
		}
	}, function(error) {
		console.log('Error: ' + error.code + ' ' + error.message);
	});
}
function getNMNewMovie(){
	getMovieIngData("","NMYL",{
		success:function(data){
			console.log(data);
			for(var i = 0; i < data.length; i++){
				console.log(data[i].name);
				var name = data[i].name;
				var releaseDate = formatDate("y-m-d",data[i].releaseDate);
				// return;
				var YLData = {
					"name":name,
					"releaseDate":releaseDate
				}
				saveYLMovie(YLData,{
					success:function(){

					},
					error:function(){

					}
				})
			}
		},
		error:function(error){
			console.log(error);
		}
	});
}
// getMovieIngData("","NMYL",{
// 	success:function(data){
// 		console.log(data);
// 		for(var i = 0; i < data.length; i++){
// 			console.log(data[i].name);
// 			var name = data[i].name;
// 			var releaseDate = formatDate("y-m-d",data[i].releaseDate);
// 			// return;
// 			var YLData = {
// 				"name":name,
// 				"releaseDate":releaseDate
// 			}
// 			saveYLMovie(YLData,{
// 				success:function(){
//
// 				},
// 				error:function(){
//
// 				}
// 			})
// 		}
// 	},
// 	error:function(error){
// 		console.log(error);
// 	}
// });
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
	    // service: "Gmail",
	    // auth: {
	    //     user: "raodaqi@gmail.com",
	    //     pass: "rdq951019"
	    // }
			host: "smtp.qq.com", // 主机
	    secureConnection: true, // 使用 SSL
	    port: 465, // SMTP 端口
			auth: {
        user: "598471284@qq.com", // 账号
        pass: "ujmeahoeapczbfag" // 密码
    }
	});
	//邮件配置，发送一下 unicode 符合的内容试试！
	var mailOptions = {
	    from: "Fred Foo <598471284@qq.com>",       // 发送地址
	    // to: "bar@blurdybloop.com, baz@blurdybloop.com", // 接收列表
	    to: to,
	    subject: "您关注的电影"+movie+"在"+platform+"上价格低于您设置的价格  ",                             // 邮件主题
	    text: "快去"+platform+"上购买吧。祝你观影愉快",                          // 文本内容
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

// sendEmail("598471284@qq.com","ceshi","ceshi");
// getMoviesData();
function getBJMovies(){
	getMoviePage1FromBJData();
	// getMoviePage2FromBJData();
	// getMoviePage3FromBJData();
}
// getBJMovies();
//清空movies里的所有数据
function moviesDelete(){
	var query = new AV.Query('Movies');
	query.destroyAll(result).then(function() {
	  // 删除成功
	  console.log(result);
	}, function() {
	  // 失败
	});
}
// moviesDelete();

//初始化并设置定时任务的时间
 var rule = new schedule.RecurrenceRule();
 rule.hour =0;rule.minute =0;rule.second =0;

//处理要做的事情
	var j = schedule.scheduleJob(rule, function(){
	    // console.log('我在这里处理了某些事情...');
	    moviesDelete();
			// getMoviesData();
			// getBJMovies();
	});

	var rule2 = new schedule.RecurrenceRule();
	rule2.hour =0;rule2.minute =0;rule2.second =30;

	//处理要做的事情
	 var k = schedule.scheduleJob(rule2, function(){
			 // console.log('我在这里处理了某些事情...');
			 getMoviesData();
			 // getBJMovies();
	 });
	 var rule3 = new schedule.RecurrenceRule();
	 rule3.hour =0;rule3.minute =1;rule3.second =0;

	//处理要做的事情
	 var l = schedule.scheduleJob(rule3, function(){
			 // console.log('我在这里处理了某些事情...');
			 // getBJMovies();
			 getBJMovies();
	 });
	// getMoviesData();
	// getBJMovies();

	var rule4 = new schedule.RecurrenceRule();
	rule4.hour =0;rule4.minute =2;rule4.second =0;

 //处理要做的事情
	var m = schedule.scheduleJob(rule4, function(){
			// console.log('我在这里处理了某些事情...');
			// getBJMovies();
			getNMNewMovie();
	});
	// getNMNewMovie();

	 var sendRule = new schedule.RecurrenceRule();
　　var times = [2,4,7,10,12,14,16,18,20,21];
// 　　for(var i=1; i<60; i++){
// 　　　　times.push(i);
// 　　}
　　sendRule.hour = times;
		sendRule.minute =0;
		sendRule.second =0;
　　var c=0;
　　var j = schedule.scheduleJob(sendRule, function(){
     　 c++;
      　console.log(c);
				sendLowPriceEmail();
　　});
// sendLowPriceEmail();
	 // getBJMovies();
// getMovieDetailFromNM("9932");
app.get('/announce', function(req, res) {
		// var query = new AV.Query('Announce');
		// query.addDescending('time');
		// query.find().then(function(results) {
		// 	// 处理返回的结果数据
		// 	console.log(results);
		// 	res.render('announce', {results:results});
		// }, function(error) {
		// 	console.log('Error: ' + error.code + ' ' + error.message);
		// 	res.render('announce', {results:error});
		// });

});

app.get('/signin', function(req, res) {
	console.log(req.AV.user);
  if (req.AV.user) {
        res.redirect('/movie');
    } else {
        res.render('signin');
    }
});

app.get('/logout', function(req, res) {
  // AV.Cloud.CookieSession 将自动清除登录 cookie 信息
  AV.User.logOut();
  res.redirect('/signin');
});

app.post('/signin', function(req, res) {
  var username = req.body.email;
  var password = req.body.password;
  AV.User.logIn(username, password, {
	  success: function(user) {
	    // 成功了，现在可以做其他事情了.
	    res.send(user);
	  },
	  error: function(user, error) {
	    // 失败了.
	    res.send(error);
	  }
	});
});

app.get('/user/signup', function(req, res) {
  res.render('signup');
});

app.post('/user/info', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var user = new AV.User();
  user.set("email", email);
  user.set("password", password);
  user.set("username", email);

  user.signUp(null, {
		success: function(user) {
		    // 注册成功，可以使用了.
		    if(user){
		    	res.send(user);
		    	// res.render('/setverifysent', { user: user });
		    }
		},
		error: function(user, error) {
		    // 失败了
		    console.log("Error: " + error.code + " " + error.message);;
		    res.send("Error: " + error.code + " " + error.message);;
		}
	});
});

app.get('/detail/:id', function(req, res) {
	var id = req.params.id;
	var currentUser = AV.User.current();
	// var email = currentUser.attributes.email;
	if(currentUser){
		var email = currentUser.attributes.email;
	}else{
		var email = '';
	}

	console.log(id);
	var query = new AV.Query('Movies');
	query.equalTo('mid', id);
	query.first().then(function(results) {
		var poster = '';
		if(results.attributes.poster){
			poster = results.attributes.poster;
		}else{
			poster = results.attributes.img;
		}
		console.log(poster);
		if(id){
			// getMovieIngData(id,"",{
			// 	success:function(price){
			// 		console.log(price);
					getMovieDetailFromNM(id,{
						success:function(movieDetail){
							// console.log(result);
							// res.render('detail', {movieDetail:movieDetail,id:id,poster:poster});
							if(email){
								console.log(movieDetail.name+":"+movieDetail.name.length);
								getAttention(email,movieDetail.name,{
									success:function(attention){
										console.log("attention:"+attention);
										res.render('detail', {movieDetail:movieDetail,id:id,poster:poster,attention:attention,email:email});
									},
									error:function(error){
										console.log(error);
									}
								});
							}else{
								res.render('detail', {movieDetail:movieDetail,id:id,poster:poster,attention:0,email:email});
							}
						},
						error:function(error){
							console.log(error);
							res.render('detail', {movieDetail:'',id:'',poster:'',attention:0,email:email});
						}
					})
		}else{
			res.render('detail', {movieDetail:"",id:'',poster:'',attention:0,email:email});
		}
	}, function(error) {
	  console.log('Error: ' + error.code + ' ' + error.message);
	});

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

app.post('/attention', function(req, res) {
	var name = req.body.name;
	console.log(name+":"+name.length);
	var price = req.body.price;
	var currentUser = AV.User.current();
	var post = AV.Object.new('Attention');

	// return;
	if(currentUser){
		var email = currentUser.attributes.email;
		console.log(currentUser.attributes.email);
		// post.set("name", name);
		// post.set("price", price);
		// post.set("email", email);
		var query = new AV.Query('Attention');
		query.equalTo("email", email);
		query.equalTo("name", name);
		query.find().then(function(results) {
		  console.log('Successfully retrieved ' + results.length + ' posts.');
		  // 处理返回的结果数据
		  console.log(results.length);
			if(results.length=="0"){
				post.set("name", name);
				post.set("price", price);
				post.set("email", email);
				post.save().then(function(post) {
				  // 成功保存之后，执行其他逻辑.
				  res.send(post);
				  console.log('New object created with objectId: ' + post.id);
				}, function(err) {
				  // 失败之后执行其他逻辑
				  // error 是 AV.Error 的实例，包含有错误码和描述信息.
				  res.send(err);
				  console.log('Failed to create new object, with error message: ' + err.message);
				});
			}else {
			    query.get(results[0].id).then(function(post) {
			        // 成功，回调中可以取得这个 Post 对象的一个实例，然后就可以修改它了
			        post.set("name", name);
							post.set("price", price);
							post.set("email", email);
					        post.save().then(function(post) {
					            // 成功保存之后，执行其他逻辑.
					            res.send(post);
					            console.log('New object created with objectId: ' + post.id);
						    }, function(err) {
						            // 失败之后执行其他逻辑
						            // error 是 AV.Error 的实例，包含有错误码和描述信息.
						        res.send(err);
						        console.log('Failed to create new object, with error message: ' + err.message);
						    });
					    }, function(error) {
					        // 失败了
					        res.send(error);
					        console.log(error);
					    });
			}
		}, function(error) {
		  res.send(error);
		  console.log('Error: ' + error.code + ' ' + error.message);
		});
	}else{
		res.send("{message:'用户没有登陆',code:'401'}");
	}
	// post.set("name", name);
	// post.set("price", price);
	// post.save().then(function(post) {
	// 	// 成功保存之后，执行其他逻辑.
	// 	console.log('New object created with objectId: ' + post.id);
	// }, function(err) {
	// 	// 失败之后执行其他逻辑
	// 	// error 是 AV.Error 的实例，包含有错误码和描述信息.
	// 	console.log('Failed to create new object, with error message: ' + err.message);
	// });
});

// app.post('/price', function(req, res) {
// 	var id = req.body.id;
// 	console.log(id);
// 	getMovieIngData(id,"",{
// 		success:function(price){
// 			console.log(price);
// 			res.send(price);
// 		},
// 		error:function(error){
// 			console.log(error);
// 			// res.send(error);
// 		}
// 	})
// });

app.get('/', function(req, res) {
	res.render('test', {});
});

app.get('/test', function(req, res) {
  res.render('test', {});
});

function getAttention(email,movie,callback){
	var query = new AV.Query('Attention');
	if(!movie){
		query.equalTo('email', email);
		query.find().then(function(results) {
		  // callback.success(results);
			var attention = [];
			for(var i = 0; i < results.length; i++){
				attention[i] = {
					"name":results[i].attributes.name
				};
			}
			// console.log(attention);
			callback.success(attention);
		}, function(error) {
		  // console.log('Error: ' + error.code + ' ' + error.message);
		  callback.success(error);
		});
	}else{
		query.equalTo('email', email);
		query.equalTo('name', movie);
		query.find().then(function(results) {
		  // callback.success(results);
			var attention = results.length;
			console.log(results);
			console.log("attention:"+attention);
			callback.success(attention);
		}, function(error) {
		  // console.log('Error: ' + error.code + ' ' + error.message);
		  callback.success(error);
		});
	}
}
// getAttention("598471284@qq.com","疯狂动物城",{
// 	success:function(attention){
// 		console.log(attention);
// 	},
// 	error:function(error){
// 		console.log(error);
// 	}
// });
app.get('/movie', function(req, res) {
	var currentUser = AV.User.current();
	if(currentUser){
		var email = currentUser.attributes.email;
	}else{
		var email = '';
	}

	var query = new AV.Query('Movies');
	query.notEqualTo('mid', null);
	query.addDescending('releaseDate');
	query.find().then(function(results) {
		// 处理返回的结果数据
		// console.log(results);
		// res.render('movie', {results:results});
		if(email){
			getAttention(email,"",{
				success:function(attention){
					// console.log(results.length);
					// console.log(attention);
					var attentionData = [];
					for(var i = 0; i < results.length; i++){
						// console.log(results[i].attributes.name+":"+results[i].attributes.name.length);
						// console.log(results[i].attributes.name.length);
						for(var j = 0; j < attention.length; j++){
							// console.log(attention[j].name);
							// console.log(attention[j].name+":"+attention[j].name.length);

							// 数据库输入的数据存在空格，这里是出去字符串中的空格
							if(attention[j].name.replace(/\s+/g,"") == results[i].attributes.name.replace(/\s+/g,"")){
								console.log(attention[j].name);
								attentionData[j] = {
									"name":results[i].attributes.name,
									"mid":results[i].attributes.mid,
									"type":results[i].attributes.type,
									"img":results[i].attributes.img,
									"star":results[i].attributes.star,
									"releaseDate":results[i].attributes.releaseDate
								}
							}
						}
					}
					console.log(attentionData);
					res.render('movie', {results:results,attentionData:attentionData,email:email});
				},
				error:function(error){
					console.log(error);
				}
			});
		}else{
			res.render('movie', {results:results,attentionData:'',email:""});
		}
	}, function(error) {
		console.log('Error: ' + error.code + ' ' + error.message);
		res.render('movie', {results:error,attentionData:'',email:""});
	});
  // res.render('movie', {});
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();

// module.exports = app;
