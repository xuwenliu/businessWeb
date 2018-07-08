/**
 * router
 */
var sysApp = angular.module("sysApp", ["ui.router", "sysController", "sysService","sysFilter"]);

sysApp.factory('myDetector', function($location, $q,$cookieStore) {
    return {
        response: function(response) {
            if(response.data.stateCode==312) {
                $cookieStore.remove("userName");
                errorMsg.make({msg: "请登录,2秒后自动跳转到登录页!", url: ""});
                return response;
            }else{
                return response;
            }
        },
        request: function(conf){
            return conf;
        },
        requestError: function(err){
            return $q.reject(err);
        },
        responseError: function(err){
            //console.log(err);
            if(err.status === 0) {
                $cookieStore.remove("userName");
                errorMsg.make({msg: "与服务端通信失败!", url: "",second:5});
            } else if(err.status ==404 ) {
                errorMsg.make({msg: "接口地址错误!"});
            } else {
                errorMsg.make({msg: "请求失败!"});
            }
            return $q.reject(err);
        }
    };

});

sysApp.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.withCredentials = true; // 带凭证 cookies
    $httpProvider.interceptors.push('myDetector');
    $httpProvider.defaults.useXDomain = true;

    //delete $httpProvider.defaults.headers.common['X-Requested-With']; //不再支持异步
    //$httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    //$httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
    //$httpProvider.defaults.headers.common['Access-Control-Max-Age'] = '1728000';
    //$httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript';
    //$httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
    //$httpProvider.defaults.headers.common['Authorization'] = 'code';//新增请求头属性,授权信息
    //$httpProvider.defaults.useXDomain = true;
    //$httpProvider.defaults.headers.common['token'] = '12345678';//新增请求头属性

}]).config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when("", "/login")
    .when("/admin", "/login")
    .when("/manage", "/login")
    .otherwise('/404');

    $stateProvider
        //404跳转
        .state("404", {
            url: "/404",
            templateUrl: "../404.html"
        })
        .state("login", {
            url: "/login",
            templateUrl: "/templates/login.html",
            controller: "LoginController"
        })
        .state("main", {
            url: "/main",
            templateUrl: "/templates/main.html",
            controller:"MainController"
        })

        //首页统计
        .state("main.default", {
            url: "/default",
            templateUrl: "/templates/center/default/default.html",
            controller:"DefaultController"
        })

        //账户管理
        .state("main.manageInfo", {
            url: "/manageInfo",
            templateUrl: "/templates/center/manage/manageInfo.html",
            controller:"ManageInfoController"
        })

        //服务设置
        .state("main.service-setting", {
            url: "/service-setting",
            templateUrl: "/templates/center/manage/manage-service-setting.html",
            controller:"ManageServiceSetController"
        })

        //服务设置详细内容
        .state("main.service-setting-info", {
            url: "/service-setting-info",
            templateUrl: "/templates/center/manage/service-setting-info.html",
            controller:"ManageServiceSetInfoController"
        })

        //账户总揽
        .state("main.accountInfo", {
            url: "/accountInfo",
            templateUrl: "/templates/center/manage/accountInfo.html",
            controller:"AccountInfoController"
        })

        //账户管理
        .state("main.account-manage", {
            url: "/account-manage",
            templateUrl: "/templates/center/manage/account-manage.html",
            controller:"AccountManageController"
        })

        //账户设置
        .state("main.manage-setting", {
            url: "/manage-setting",
            templateUrl: "/templates/center/manage/manage-setting.html",
            controller:"ManageSettingController"
        })

        //员工列表
        .state("main.employee", {
            url: "/employee",
            templateUrl: "/templates/center/employee/employee-list.html",
            controller:"EmployeeListController"
        })

        //推客列表
        .state("main.twitter-list", {
            url: "/twitter-list",
            templateUrl: "/templates/center/employee/twitter-list.html",
            controller:"TwitterListController"
        })

        //推客列表
        .state("main.twitter-info", {
            url: "/twitter-list-info",
            templateUrl: "/templates/center/employee/twitter-info.html",
            controller:"TwitterInfoController"
        })

        //新增员工
        .state("main.employee-add", {
            url: "/employee-add",
            templateUrl: "/templates/center/employee/employee-add.html",
            controller:"EmployeeAddController"
        })

        //员工作品列表
        .state("main.employee-caseinc-list", {
            url: "/employee-caseinc-list",
            templateUrl: "/templates/center/employee/employee-caseinc-list.html",
            controller:"EmployeeCaseIncListController"
        })

        //作品列表
        .state("main.case", {
            url: "/case",
            templateUrl: "/templates/center/case/case-list.html",
            controller:"CaseListController"
        })



        //新增作品part1
        .state("main.case-add-p1", {
            url: "/case-add-p1",
            templateUrl: "/templates/center/case/case-add-p1.html",
            controller:"CaseAddOneController"
        })

        //新增作品part2
        .state("main.case-add-p2", {
            url: "/case-add-p2",
            templateUrl: "/templates/center/case/case-add-p2.html",
            controller:"CaseAddSecController"
        })

        //新增作品part3
        .state("main.case-add-p3", {
            url: "/case-add-p3",
            templateUrl: "/templates/center/case/case-add-p3.html",
            controller:"CaseAddTrdController"
        })
        //新增作品part4
        .state("main.case-add-p4", {
            url: "/case-add-p4",
            templateUrl: "/templates/center/case/case-add-p4.html",
            controller:"CaseAddFourController"
        })


        //作品详情
        .state("main.case-info", {
            url: "/case-info",
            templateUrl: "/templates/center/case/case-info.html",
            controller:"CaseInfoController"
        })

        //客户列表
        .state("main.customer", {
            url: "/customer",
            templateUrl: "/templates/center/customer/customer-list.html",
            controller:"CustomerListController"
        })

        //客户详情
        .state("main.customer-info", {
            url: "/customer-info",
            templateUrl: "/templates/center/customer/customer-info.html",
            controller:"CustomerInfoController"
        })

        //客户详情-基本信息
        .state("main.customer-info.customer-basic", {
            url: "/customer-basic",
            templateUrl: "/templates/center/customer/customer-basic.html",
            controller:"CustomerInfoController"
        })

        //客户对应聊天列表
        .state("main.customer-info.customer-chat", {
            url: "/customer-chat",
            templateUrl: "/templates/center/customer/customer-chat.html",
            controller:"CustomerChatListController"
        })

        //客户对应订单列表
        .state("main.customer-info.order-list", {
            url: "/customer-order-list",
            templateUrl: "/templates/center/customer/customer-order-list.html",
            controller:"CustomerOrderListController"
        })

        //客户对应账单列表
        .state("main.customer-info.customer-bill-list", {
            url: "/customer-bill-list",
            templateUrl: "/templates/center/customer/customer-bill-list.html",
            controller:"CustomerBillController"
        })

        //客户对应退款列表
        .state("main.customer-info.refund-list", {
            url: "/customer-refund-list",
            templateUrl: "/templates/center/customer/customer-refund-list.html",
            controller:"CustomerRefundListController"
        })

        //使用优惠券
        .state("main.coupon-used", {
            url: "/coupon-used",
            templateUrl: "/templates/center/activity/coupon-used.html",
            controller:"CouponUsedController"
        })

        //优惠券使用列表
        .state("main.coupon-list", {
            url: "/coupon-list",
            templateUrl: "/templates/center/activity/coupon-list.html",
            controller:"CouponListController"
        })

        //订单列表
        .state("main.order-list", {
            url: "/order-list",
            templateUrl: "/templates/center/order/order-list.html",
            controller:"OrderListController"
        })

        //创建订单合同订单
        .state("main.order-list-create", {
            url: "/order-list-create",
            templateUrl: "/templates/center/order/order-create.html",
            controller:"OrderCreateController"
        })

        //创建订单合同订单阶段
        .state("main.order-list-create-step", {
            url: "/order-list-create-step",
            templateUrl: "/templates/center/order/order-create-step.html",
            controller:"OrderCreateStepController"
        })

        //订单详情
        .state("main.order-list-info", {
            url: "/order-list-info",
            templateUrl: "/templates/center/order/order-info.html",
            controller:"OrderInfoController"
        })
        //订单基本信息tab1
        .state("main.order-list-info.order-base-info", {
            url: "/order-base-info",
            templateUrl: "/templates/center/order/order-base-info.html",
            controller:"OrderBaseInfoController"
        })

        //合同订单基本信息tab1
        .state("main.order-list-info.order-base-step-info", {
            url: "/order-base-step-info",
            templateUrl: "/templates/center/order/order-base-step-info.html",
            controller:"OrderBaseStepInfoController"
        })

        //订单信息-进度
        .state("main.order-list-info.order-step-info", {
            url: "/order-step-info",
            templateUrl: "/templates/center/order/order-create-step.html",
            controller:"OrderCreateStepController"
        })

        //退款列表
        .state("main.refund-list", {
            url: "/refund-list",
            templateUrl: "/templates/center/order/refund-list.html",
            controller:"RefundListController"
        })

        //退款详情
        .state("main.refund-list-info", {
            url: "/refund-list-info",
            templateUrl: "/templates/center/order/refund-info.html",
            controller:"RefundInfoController",
            reload: true
        })

        //订单中的退款列表
        .state("main.order-list-info.order-refund-list", {
            url: "/order-refund-list",
            templateUrl: "/templates/center/order/order-refund-list.html",
            controller:"OrderRefundListController"
        })

        //站内信
        .state("main.mail-list", {
            url: "/mail-list",
            templateUrl:"/templates/center/mail/mail-list.html",
            controller:"MailController"
        })

        //账单列表
        .state("main.bill-list", {
            url: "/bill-list",
            templateUrl: "/templates/center/bill/bill-list.html",
            controller:"BillListController"
        })

        //点评管理-点评列表
        .state("main.comments-list", {
            url: "/comments-list",
            templateUrl: "/templates/center/comments/comments-list.html",
            controller:"CommentsListController"
        })


});
