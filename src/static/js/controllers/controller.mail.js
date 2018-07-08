sysController.controller("MailController", ["$scope", "$http", "$window", "$grid","$dateTool","$filter",
    function ($scope, $http, $window, $grid, $dateTool, $filter) {
        $grid.initial($scope, [$window.API.MAIL.MAIL_LIST].join(""),{orderBy:"sendTime"});

        $scope.showType= function(type) {
            var result = null;
            switch (type) {
                case 1 :
                    result =  "普通消息";
                    break;
                case 2 :
                    result = "案例会话消息";
                    break;
                case 3 :
                    result = "预约订单消息";
                    break;
            }
            return result;
        }

        $scope.showTime = function(time) {
            return $filter('date')(time, 'yyyy-MM-dd HH:mm:ss');
        }

        /*查询*/
        var postData={};
        $scope.submitSearch=function(dt){
            var dt=angular.copy(dt)||{};
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:false});// 时间判断
            if(( $scope.dateThan)){
                return false;
            }
            console.log(dt)
            postData.beginTime=$filter('date')($.trim(angular.element("#beginTime").val()), 'yyyyMMdd');
            postData.endTime=$filter('date')($.trim(angular.element("#endTime").val()), 'yyyyMMdd');
            postData.orderBy = "sendTime";
            $scope.filtering(postData);
        };

        $dateTool.ele('.form_datetime_start,.form_datetime_end');
    }
]);