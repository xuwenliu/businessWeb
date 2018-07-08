/**
 * MENU /USERINFO
 */

var sysController = angular.module("sysController", []);
sysController.controller("MainController", ["$scope", "$http", "$cookieStore", "$rootScope","GET_TOKEN", "$window", function ($scope, $http, $cookieStore, $rootScope,GET_TOKEN, $window) {

    /*获取上传GET_TOKEN*/
    GET_TOKEN();
    GET_TOKEN({v:true});

    $scope.Version=window.Version;
    $scope.userName= $cookieStore.get("userName");
    $scope.headImage= $cookieStore.get("headImage");

    /*tagsBaseText*/
    $scope.tagsBaseText={
        face:"图片比例：1:1、尺寸1500 * 1500 像素以上； 建议大小1MB-10MB之间 ",
        design_l:"图片比例不限、图片宽度1000像素以上、黑白色；建议大小1MB-10MB之间 ",
        design_r:"图片比例：3:2（高）、尺寸1500*1000像素以上、彩色；去掉尺寸、文字、标注等无用信息，左右留一定边距；建议大小1MB-10MB之间",
        common:"图片比例不限、图片宽度1000像素以上； 建议大小1MB-10MB之间"
    };

    /*menus*/
    $scope.menus= {
        "menus": [
            {
                "name": "首页",
                "id": 10000,
                "url": "",
                "icon": "&#xe608;",
                "childs": [
                    {
                        "name": "概况",
                        "id": 13000,
                        "url": ".default",
                        "childs": [],
                        "icon": ""
                    }
                ]
            },
            {
                "name": "作品管理",
                "id": 10000,
                "url": "",
                "icon": "&#xe63b;",
                "childs": [
                    {
                        "name": "作品列表",
                        "id": 13000,
                        "url": ".case",
                        "childs": [],
                        "icon": ""
                    }
                ]
            },
            {
                "name": "员工管理",
                "id": 10000,
                "url": "",
                "icon": "&#xe613;",
                "childs": [
                    {
                        "name": "员工列表",
                        "id": 13000,
                        "url": ".employee",
                        "childs": [],
                        "icon": ""
                    }

                    //{
                    //    "name": "推客列表",
                    //    "id": 13000,
                    //    "url": ".twitter-list",
                    //    "childs": [],
                    //    "icon": ""
                    //}
                ]
            },
            {
                "name": "客户管理",
                "id": 10000,
                "url": "",
                "icon": "&#xe639;",
                "childs": [
                    {
                        "name": "客户列表",
                        "id": 13000,
                        "url": ".customer",
                        "childs": [],
                        "icon": ""
                    }
                ]
            },

            {
                "name": "账单管理",
                "id": 10000,
                "url": "",
                "icon": "&#xe650;",
                "childs": [
                    {
                        "name": "账单列表",
                        "id": 13000,
                        "url": ".bill-list",
                        "childs": [],
                        "icon": ""
                    }
                ]
            },
            {
                "name": "账户管理",
                "id": 10000,
                "url": "",
                "icon": "&#xe60f;",
                "childs": [
                    {
                        "name": "公司信息",
                        "id": 13000,
                        "url": ".manageInfo",
                        "childs": [],
                        "icon": ""
                    },
                    {
                        "name": "服务设置",
                        "id": 13000,
                        "url": ".service-setting",
                        "childs": [],
                        "icon": ""
                    },
                    {
                        "name": "资金总览",
                        "id": 13000,
                        "url": ".accountInfo",
                        "childs": [],
                        "icon": ""
                    },
                    {
                        "name": "系统设置",
                        "id": 13000,
                        "url": ".manage-setting",
                        "childs": [],
                        "icon": ""
                    }
                ]
            },
            {
                "name": "点评管理",
                "id": 10000,
                "url": "",
                "icon": "&#xe653;",
                "childs": [
                    {
                        "name": "点评列表",
                        "id": 13000,
                        "url": ".comments-list",
                        "childs": [],
                        "icon": ""
                    }
                ]
            },
        ]
    };

    //菜单效果
    $scope.$on("ngRepeatMenu",function(){
        //render 完成后执行JS
        var icon=angular.element(".menus i.iconfont"),
            menus=angular.element(".menus dt"),
            m_a=angular.element(".menus dd a"),
            iconArr=$scope.menus.menus,
            urlArr=[],
            tag=window.location.hash;


        icon.each(function(j){
            $(this).html(iconArr[j].icon)
        });

        menus.on("click", function(){
            var t=$(this),
                isSwap=true,
                sq= t.find("em");
            !t.hasClass("hover")&&isSwap?t.next("dd").slideDown(100).parents("dl").siblings().find("dd").slideUp(100):t.next("dd").slideDown(100);
            t.addClass("hover").parents("dl").siblings().find("dt").removeClass("hover");
            t.addClass("hover").parents("dl").siblings().find("dd a").removeClass("hover");
        });



        m_a.each(function(){
            var hashStr=tag;//"."+tag.split("/").reverse()[0],
            var urlStr=$(this).attr("ui-sref").replace(".","");
                urlArr.push(urlStr);

            if(hashStr.indexOf(urlStr)>-1){
                $(this).addClass("hover").parents("dd").prev("dt").click();
            }

        }).click(function(){
            $(this).addClass("hover").siblings().removeClass("hover");
            var url;
            if (!!window.location.port) {
                url = "http://" + window.location.hostname + ":" + window.location.port + "/" + $(this).attr("href");
            }
            else {
                url = "https://" + window.location.hostname + "/" + $(this).attr("href");
            }
            var href = window.location.href;
            if (url == href) {
                window.location.reload();
            }
        });

        //后退菜单状态
        if (window.history && window.history.pushState) {
            $(window).on('popstate', function () {
                var hashStr=window.location.hash;
                m_a.removeClass("hover");
                for(var  j in urlArr){
                    if(hashStr.indexOf(urlArr[j])>-1){
                        $(".menus a[href *= '"+urlArr[j]+"']").addClass("hover").parents("dd").prev("dt").click();
                    }
                }
            });
        }
    });

}]);
