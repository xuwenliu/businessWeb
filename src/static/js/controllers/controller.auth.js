/**
 * login , logout
 */

sysController.controller("LoginController", ["$scope", "$http", "$window","$timeout","$cookieStore","$validate","$province","$city","$area",
    function ($scope, $http, $window,$timeout,$cookieStore,$validate,$province,$city,$area) {

        $cookieStore.get("userName")?$window.location.href="#/main/default":"";

        $scope.Version=window.Version;
        $scope.pubRegex=$validate.pubRegex.rule;
        $scope.login_=true;
        $scope.ltIe10=isLtie10();
        $scope.success=false;
        $scope.setpowbox=$scope.findpowbox1=$scope.findpowbox2=false;
        $scope.setpowtitle="初次登录请修改密码";
        /*初始化*/
        $scope.loginInfo={ "userName": $cookieStore.get("remember_userName2"),"password": ""};
        $scope.setpow={ "password": "","password2": ""};
        $scope.findpow={ "userName": "","phone": "","smsCode":""};

        /*登录*/
        $scope.login = function (data) {
            var data_ = angular.copy(data);
            $scope.errorMsg="";

            if (!data_.userName) {
                $scope.errorMsg = "用户名格式不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (!data_.password){
                $scope.errorMsg = "密码格式不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (data_.userName && data_.password) {
                data_.password=Rsa(data_.password);
                $scope.errorMsg = "登录中...";
                $scope.ngDisable=true;
                $http.post($window.API.SYS.LOGIN, data_ )
                    .success(function (res) {
                        console.log(res);
                    if (!res.stateCode) {
                        $cookieStore.put("userName",res.data.userName);
                        $cookieStore.put("headImage",res.data.showHead);
                        $cookieStore.put("remember_userName2",res.data.userName);
                        $scope.errorMsg = "登录中...";
                        $scope.ngDisable=true;
                        $timeout(function(){
                            $window.location.href = "#/main/default";
                        })

                    } else if(res.stateCode==313){
                        $cookieStore.put("userName",data_.userName);
                        $scope.errorMsg="";
                        $scope.ngDisable=false;
                        $scope.login_=false;
                        $scope.setpowbox=true;
                        $scope.setpow.token=res.message;

                    }else{
                        $scope.ngDisable=false;
                        $scope.errorMsg = res.message;

                    };
                });
            };
        };

        /*首次重置密码*/
        $scope.setpowFun=function(dt){
            var dt = angular.copy(dt);
            $scope.errorMsg="";
            dt.userName=$cookieStore.get("userName");


            if (!dt.password) {
                $scope.errorMsg = "密码格式不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (!(dt.password==dt.password2)){
                $scope.errorMsg = "两次输入密码不相同";
                console.log($scope.errorMsg);
                return false
            }else{
                delete dt.password2;
                dt.password=Rsa(dt.password);
                $http.post($window.API.SYS.FIRST_RESET_POW, dt ).success(function (res) {

                    if (!res.stateCode) {
                        $scope.errorMsg="恭喜您，密码重置成功"+"，3秒后返回登录界面。";
                        $timeout(function(){
                            $scope.loginInfo.password="";
                            $scope.login_=true;
                            $scope.setpowbox=false;
                            $scope.errorMsg="";
                        },3000)
                    } else {
                        $scope.errorMsg = res.message;
                    };
                });
            }

        };

        /*验证身份*/
        $scope.phone=true;
        $scope.findpowFun=function(dt){
            var dt = angular.copy(dt);
            console.log(dt);
            $scope.errorMsg="";
            if (!dt.userName) {
                $scope.errorMsg = "用户名格式不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (!dt.phone) {
                $scope.errorMsg = "手机号输入不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (!dt.smsCode) {
                $scope.errorMsg = "验证码输入不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (!dt.password) {
                $scope.errorMsg = "密码格式不正确";
                console.log($scope.errorMsg);
                return false
            }
            if (!(dt.password==dt.password2)){
                $scope.errorMsg = "两次输入密码不相同";
                console.log($scope.errorMsg);
                return false
            }

            if(dt.userName && dt.phone && dt.smsCode){
                $cookieStore.put("userName",dt.userName);
                dt.password=Rsa(dt.password);
                delete dt.password2;
                $http.post($window.API.SYS.FIND_CHECK, dt ).success(function (res) {
                    if (!res.stateCode){
                        $scope.errorMsg="恭喜您，密码重置成功"+"，3秒后返回登录界面。";
                        $timeout(function(){
                            $scope.login_=true;
                            $scope.setpowbox=false;
                            $scope.findpowbox1=false;
                            $scope.errorMsg="";
                            $scope.loginInfo.password="";
                        },3000)
                    } else {
                        $scope.errorMsg = res.message;
                    }
                });
            }
        };
        $scope.findPow=function(){
            $scope.findpow={ "userName": "","phone": "","smsCode":""};
            $scope.errorMsg="";
            $scope.login_=false;
            $scope.setpowbox=false;
            $scope.findpowbox1=true;
        };


        /*获取验证码*/
        $scope.getCode=function(data){
            $scope.errorMsg="";
            var b=angular.element(".getcode ,.in-phone"),
                t=angular.element(".sec");

            b.attr("disabled",true);
            var sec=60;
            var timer=window.setInterval(function(){
                sec-=1;
                t.text(sec+"秒后重新发送");
                if(!sec){
                    t.text("重新发送");
                    b.attr("disabled",false);
                    clearInterval(timer);
                }
            },1000);

            $http.post( $window.API.SYS.SEND_SMS_CODE,{"phone":data[1],userName:data[0]}).success(function(res){
                if(!res.stateCode){

                }else{
                    $scope.errorMsg = res.message;
                }
            })
        };

        $scope.enterEvent = function (e) {
            if (e.keyCode === 13){
                $scope.login($scope.loginInfo);
            }
        };


        /*申请入驻商家*/

        $scope.joinUs=function(){
            $scope.joinus={};
            $scope.errorMsg="";
            $scope.login_=false;
            $scope.setpowbox=false;
            $scope.findpowbox1=false;
            $scope.joinus1=true;

            //加载省
            (function () {
                $province.get()
                    .success(function (data) {
                        $scope.provinces=data["data"];
                    })
            })();

            //监视省变化改变市
            $scope.$watch("joinus.provinceId",function(data){
                if(data){
                    $city.get({id: data})
                        .success(function (data) {
                            $scope.cities = data["data"];
                            $scope.joinus.areaId=null;
                        });
                }
            });

            //监视市变化改变区
            $scope.$watch("joinus.cityId",function(data){
                if(data){
                    $area.get({id: data})
                        .success(function (data) {
                            if(!data.succ){
                                $scope.isAreaShow=false;
                                $scope.joinus.areaId = $scope.joinus.cityId;
                            }else{
                                $scope.isAreaShow=true;
                            }
                            $scope.areas = data["data"];
                        });
                }

            });
        };

        /*官网判断*/
        var join=get_param($window.location.href, "join")*1;
        if(join==1){
            $scope.joinUs();
        }



        /*提交*/
        $scope.joinUsFun=function(dt){
            var dt = angular.copy(dt);
            console.log(dt);
            $scope.errorMsg="";
            $scope.success=false;
            if (!dt.companyName) {
                $scope.errorMsg = "公司名为2-30个字符，不为纯数字！";
                console.log($scope.errorMsg);
                return false
            }
            if (!dt.provinceId) {
                $scope.errorMsg = "请选择省或直辖市！";
                console.log($scope.errorMsg);
                return false
            }
            if (!dt.cityId) {
                $scope.errorMsg = "请选择城市！";
                console.log($scope.errorMsg);
                return false
            }

            if (!dt.areaId) {
                $scope.errorMsg = "请选择区域！";
                console.log($scope.errorMsg);
                return false
            }

            if (!dt.contactName) {
                $scope.errorMsg = "联系人为2-20个字符，不能为纯数字！";
                console.log($scope.errorMsg);
                return false
            }
            if (!dt.contactPhone){
                $scope.errorMsg = "请输入正确的11位手机号码！";
                console.log($scope.errorMsg);
                return false
            }

            if (!dt.smsCode) {
                $scope.errorMsg = "验证码不正确！";
                console.log($scope.errorMsg);
                return false
            }

            delete dt.cityId;
            delete dt.provinceId;

            /*submit*/
            if(dt.companyName && dt.areaId && dt.contactName && dt.contactPhone && dt.smsCode){
                $http.post($window.API.JOINUS.JOINUS_POST, dt ).success(function (res) {
                    if (!res.stateCode){
                        $scope.success=true;
                        $scope.errorMsg="恭喜您，申请提交成功，城市商务经理会在1~2个工作日内联系您。";
                        $timeout(function(){
                            $scope.joinus={};
                        },3000)
                    } else {
                        $scope.errorMsg = res.message;
                    }
                });
            }
        };


        /*获取加入验证码*/
        $scope.getJoinCode=function(data){
            $scope.errorMsg="";
            var b=angular.element(".getcode-join ,.in-phone-join"),
                t=angular.element(".sec2");

            b.attr("disabled",true);
            var sec=60;
            var timer=window.setInterval(function(){
                sec-=1;
                t.text(sec+"秒后重新发送");
                if(!sec){
                    t.text("重新发送");
                    b.attr("disabled",false);
                    clearInterval(timer);
                }
            },1000);

            $http.post( [$window.API.JOINUS.JOINUS_SMS,"?phone=",data].join("")).success(function(res){
                if(!res.stateCode){

                }else{
                    $scope.errorMsg = res.message;
                }
            })
        };
    }]);


sysController.controller("userInfoController", ["$scope", "$http", "$window","$cookieStore",
    function ($scope, $http, $window,$cookieStore) {
        //if(!$cookieStore.get("userName")){
        //    errorMsg.make({msg:"请登录,2秒后自动跳转到登录页!",url:""});
        //}

        /*退出系统*/
        $scope.logout = function () {
            if(!confirm("是否要退出系统?")){
                return false
            }
            $http({url:$window.API.SYS.LOGOUT, method:'POST'}).success(function (res) {
                if(!res.stateCode){
                    $cookieStore.remove("userName");
                    $window.location.href = "";
                }
            }).error(function(r,err){

                console.log(err)

            })

        };



        /*查看消息*/
        $scope.showMail = function() {
            $(".mailIcon").removeClass("mailIcon-active");
            $window.location.href = "#/main/mail-list";
        };

    }]);