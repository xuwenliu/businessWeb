/**
 * activity
 *
 *活动管理 > 优惠券使用列表
 */

sysController.controller("CouponListController", ["$scope", "$http", "$window","$grid",
    function($scope, $http, $window,$grid) {
        /*列表*/
        $grid.initial($scope, [$window.API.ACTIVITY.COUPON_LIST].join(""),{orderBy:"createTime"} );

        /*获取活动下拉*/
        $http.get([$window.API.ACTIVITY.ACTIVITY_TYPE,"/1"].join("")).success(function(res){// 1表示全部,2未删除&未结束的
            if(!res.stateCode){
                $scope.activityType =res.data;//活动下拉
            }
        });

        /*查询*/
        $scope.submitSearch=function(dt){
            if(dt){
                var postData=angular.copy(dt)||{};
                postData.orderBy="createTime";
                dt.couponEmployCode?postData.couponEmployCode=encodeURI(dt.couponEmployCode):"";
                $scope.filtering(postData);
            }
        };

        /*获取优惠券模板数据*/
        $scope.show=function(id){
            if(id){
                $http.get([$window.API.ACTIVITY.COUPON_TEM_INFO,"/",id].join("")).success(function(res){
                    if(!res.stateCode){
                        $scope.dataInfo=res.data;
                    }else{
                        errorMsg.make({msg:res.message});
                    }
                })
            }
        }


    }]);


/**
 *活动管理 > 使用优惠券
 */
sysController.controller("CouponUsedController", ["$scope", "$http", "$window", "$cookieStore","GET_TOKEN","QINIU","$validate","$timeout",
    function($scope, $http, $window, $cookieStore, GET_TOKEN,QINIU,$validate,$timeout) {

        /*初始数据*/
        $scope.dataInfo={};
        //提交
        var submitPass=true;//防阻塞
        /*数据验证规则*/
        $scope.pubRegex=$validate.pubRegex.rule;
        $scope.submit=function(dt){
            var  infoData=angular.copy(dt[0]);

            /*保存/校验*/
            var  nodes=angular.element(".form-control");
            nodes.blur();

            /*请求*/
            $timeout(function(){
                var nodeErr=angular.element(".err"),
                    nodeErrRes=angular.element(".err:not(.rmcolor)"),
                    nodeUpErr=angular.element(".upErr"),
                    required=angular.element(".required.err");



                dt[1]?nodeErr.first().focus():required.focus();
                errLen=nodeErrRes.length;
                upErrLen=nodeUpErr.length;
                console.log("errLen:"+errLen+"|"+upErrLen);
                if(errLen<1&&upErrLen<1&&submitPass){
                    submitPass=false;
                    $http({ url:[$window.API.ACTIVITY.COUPON_CHECK,"/",infoData.couponEmployCode].join(""), method:'POST'}).success(function(res){
                        if(!res.stateCode){
                            successMsg.make({msg:"通过校验！"});
                            $timeout(function(){
                                $scope.dataInfo.couponEmployCode="";
                            },2000)
                        }else{
                            errorMsg.make({msg:res.message});
                        }
                        submitPass=true;
                    })
                }
            });
        };



    }]);


