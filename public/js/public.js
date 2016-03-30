
  function checkUrl(url){
      var isRight = url.indexOf("http://");
      if(isRight == 0){
        return true;
      }else{
        return false;
      }
    }

    $(".navbar-toggle").on("click",function(){
        var ifExit = $(".navbar-right").hasClass("in");
        var height = $(".navbar-right").height();
        console.log(ifExit);
        console.log(height);
        if(!ifExit){
          $(".navbar-fixed-top").addClass("loading-cover");

        }else{
          $(".navbar-fixed-top").removeClass("loading-cover");
        }
      })

    function loadingShow(text){
      $("#loading p").text(text);
      $("#loading").addClass("show");
    }

    function loadingHide(){
      $("#loading").removeClass("show");
    }
    function tipShow(text){
      if(text){
        $(".ui-poptips-cnt").text(text);
      }
      $(".ui-poptips").show();
     $(".ui-poptips").css({
        "-webkit-transform":"translateY(0px)"
      });
      setTimeout(function(){
        $(".ui-poptips").css({
          "-webkit-transform":"translateY(-40px)"
        });
      },1000);
    }

    function check(msg, name){
      if (name == '') {
        tipShow(msg)
        return false;
      }else{
        return true;
      }
    }

    function checkEmail(email){
      var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,9}$/;
      if(!reg.test(email)) {
        tipShow("邮箱格式不对");
        return false;
      }else{
        return true;
      }
    }

    function checkPW(password){
      if(password.length < 6){
        tipShow("密码长度太短");
        return false;
      }else{
        return true;
      }
    }

    // function dialogShow(text){
    //   $("#dialog h4").text(text);
    //   $("#dialog").addClass("show");
    // }
    //
    // function dialogHide(){
    //   $("#dialog").removeClass("show");
    // }
    //
    // $(".delete-cancel").on("click",function(){
    //   dialogHide();
    // })
    //
    // $(".navbar").on("click",function(){
    //   var ifExit = $(".navbar-right").hasClass("in");
    //   var height = $(".navbar-right").height();
    //   console.log(ifExit);
    //   console.log(height);
    //
    //   if(ifExit){
    //
    //     setTimeout(function(){
    //       $(".navbar-fixed-top").removeClass("loading-cover");
    //       $(".navbar-collapse").removeClass("in");
    //     }, 100);
    //   }
    // })
