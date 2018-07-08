/**
 *客户管理 > 客户列表
 */
sysController.controller("CustomerListController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid) {

        $grid.initial($scope, [$window.API.CUSTOMER.CUSTOMER_LIST].join(""),{orderBy:'createTime'});

        /*查询*/
        $scope.submitSearch=function(dt){
            if(dt){
                var postData={};
                postData.orderBy='createTime';
                dt.queryKey?postData.queryKey=encodeURI(dt.queryKey):"";
                $scope.filtering(postData);
            }
        };

        //手机号隐藏中间4位数字
        $scope.phoneMethod = function(value) {
          value = value.substr(0, 3) + '****' + value.substr(7);
          return value;
        };

        //当名称默认为手机号时隐藏中间4位数字
        $scope.filterName = function(value) {
          var reg = /^1\d{10}$/;
          if (reg.test(value)) {
            value = value.substr(0, 3) + '****' + value.substr(7);
          }
          return value;
        };

        //查看详情
        $scope.show=function(dt) {
            $window.location.href=["#/main/customer-info/customer-basic","?id=",dt].join("");

        }

    }]);




/**
 *客户管理 > 客户列表 >客户详情-基本信息
 */
sysController.controller("CustomerInfoController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid) {
        /*初始数据*/
        var id=get_param($window.location.href, "id");
        $scope.id=$scope.cid=id;

        $(".tab-btn a").eq(0).addClass("hover").siblings().removeClass("hover");

        /*查看大图*/
        var eo=$(".content-box");
        eo.on("click",".preview-img",function(){
            var url=$(this).find("img").attr("data-img");
            $timeout(function(){
                $scope.preview=url;
            })
        });

        /*获取客户详情*/
        $scope.cinfo={}
        $http.get([$window.API.CUSTOMER.CUSTOMER_INFO,"/",id].join("")).success(function(res){
            if(!res.stateCode){
                $scope.cinfo=res.data;
            }
        });
    }]);

/**
 *客户管理 > 客户列表 >聊天列表
 */
sysController.controller("CustomerChatListController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid) {
        var id=get_param($window.location.href, "id");

        $(".tab-btn a").eq(1).addClass("hover").siblings().removeClass("hover");

        if(id){
            $grid.initial($scope, [$window.API.CUSTOMER.CUSTOMER_CASE_SESSION].join(""),{userId:id,orderBy:"createTime"});
        }else{
            errorMsg.make({msg:"非法请求!"})
        }
    }]);

/**
 *客户管理 > 客户列表 >账单列表
 */
sysController.controller("CustomerBillController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid","$getSelectTypes",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid,$getSelectTypes) {
        var id=get_param($window.location.href, "id");

        $(".tab-btn a").eq(2).addClass("hover").siblings().removeClass("hover");

        /* 列表 */
        $grid.initial($scope, [$window.API.BILL.CUSTOMER_BILL_LIST,id].join(""), {"billType":""});

        $http.get([$window.API.BILL.BILL_TYPES].join("")).success(function(res){
            if (res.data) {
                $scope.billTypes = res.data.billTypes;
                $scope.billContentTypes = res.data.billContentTypes;
                $scope.billStatusTypes = res.data.billStatusTypes;

            }
            else {
                errorMsg.make({msg:res.message});
            }
        });

        var postData = {
            "billType": ""
        };

        /* 账单类型筛选 */ 
        $scope.changeType=function(dt){
            postData.billType=dt;
            $scope.filtering(postData);
        };

        /* 账单内容选择 */
        $scope.$watch('list.billContentType',function(dt){
            if(dt!==undefined){
                postData.billContentType = dt;
                $scope.filtering(postData);
            }
        });

        /*账单状态选择*/
        $scope.$watch('list.status',function(dt){
            if(dt!==undefined) {
                postData.status = dt;
                $scope.filtering(postData);
            }
        });

        $scope.submitSearch = function(dt) {
            if(dt){
                postData.billNumQueryKey = dt.billNumQueryKey;
                $scope.filtering(postData);
            }
        }

    }]);


/**
 *客户管理 > 客户列表 >订单列表
 */
sysController.controller("CustomerOrderListController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid","$getSelectTypes",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid,$getSelectTypes) {
        var id=get_param($window.location.href, "id");

        $grid.initial($scope, [$window.API.CUSTOMER.CUSTOMER_ORDER_LIST,"/",id,"/order"].join(""),{orderBy:"createTime"});

        /*初始化状态下拉*/
        $getSelectTypes.select($scope,[$window.API.ORDER.ORDER_TYPES_STATUS].join(""),{"code":-1,desc:"全部"});

        /*订单内容选择*/
        var postData={};
        postData.orderBy='createTime';
        $scope.$watch('list.contentType',function(dt){
            if(dt){
                postData.contentType=dt==-1?"":dt;
                $scope.filtering(postData);
            }

        });

        /*订单状态选择*/
        $scope.$watch('list.orderStatus',function(dt){
            if(dt){
                postData.orderStatus=dt==-1?"":dt;
                $scope.filtering(postData);
            }
        });

        /*详细*/
        $scope.show=function(id,type){
            $window.location.href = ["#/main/order-list-info/order-base-step-info?id=",id,"&type=",type].join("");
        };

    }]);






/**
 *客户管理 > 客户列表 >退款列表
 */
sysController.controller("CustomerRefundListController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid","$dateTool","$filter","$getSelectTypes",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid,$dateTool,$filter,$getSelectTypes) {
        var id=get_param($window.location.href, "id");

        $grid.initial($scope, [$window.API.CUSTOMER.CUSTOMER_REFUND_LIST,"/",id,"/refundApply"].join(""),{orderBy:"createTime"});

        /*初始化状态下拉*/
        $getSelectTypes.select($scope,[$window.API.ORDER.ORDER_TYPES_STATUS].join(""),{"code":-1,desc:"全部"});

        /*初始化日历*/
        $dateTool.ele('.form_datetime_start,.form_datetime_end');

        /*查询*/
        var postData={};
        postData.orderBy='createTime';
        $scope.submitSearch=function(dt){
            var dt=angular.copy(dt)||{};
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:false});// 时间判断
            if(( $scope.dateThan)){
                return false;
            }
            console.log(dt)
            dt.orderNum?postData.orderNum=encodeURI(dt.orderNum):postData.orderNum="";
            postData.beginTime=$filter('date')($.trim(angular.element("#beginTime").val()), 'yyyyMMdd');
            postData.endTime=$filter('date')($.trim(angular.element("#endTime").val()), 'yyyyMMdd');
            $scope.filtering(postData);
        };



        /*退款状态选择*/
        $scope.$watch('list.refundStatus',function(dt){
            if(dt){
                postData.status=dt==-1?"":dt;
                $scope.filtering(postData);
            }
        });

        /*详细*/
        $scope.show=function(id){
            $window.location.href = ["#/main/refund-list-info?id=", id].join("");
        };


    }]);