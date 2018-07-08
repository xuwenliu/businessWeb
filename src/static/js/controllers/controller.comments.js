
/**
 *点评管理 > 点评列表
 */
sysController.controller("CommentsListController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid","$dateTool","$filter",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid,$dateTool,$filter) {

        /*初始化日历*/
        $dateTool.ele('.form_datetime_start,.form_datetime_end',{format: "yyyy-mm-dd",minView :2});
        $scope.employeeIds=[];
        $grid.initial($scope, [$window.API.EVALUATE.EVALUATE_LIST].join(""),{orderBy:'createTime'});


        /**
         * [查询]
         * @param  {[type]} dt [description]
         */
        var postData={};
        postData.orderBy="createTime";
        $scope.submitSearch=function(dt){
        	var dt=angular.copy(dt)||{};
            $scope.dateThan=$dateTool.compare({startTime:'.form_datetime_start input',endTime:'.form_datetime_end input',required:false,isEqual:false});// 时间判断
            if(( $scope.dateThan)){
                return false;
            }
            postData.startTime=$filter('date')($.trim(angular.element("#beginTime").val()), 'yyyy-MM-dd');
            postData.endTime=$filter('date')($.trim(angular.element("#endTime").val()), 'yyyy-MM-dd');
            console.log(postData)
            $scope.filtering(postData);
        }

        /**
         * [获取业者类型-]
         * @param  {[type]} res [description]
         * @return {[type]}     [description]
         */
        $http.get([$window.API.EVALUATE.EVALUATE_EMPLOYEETYPE].join("")).success(function(res){
            console.log(res)
            if(!res.deletedCode){
                $scope.detailTypes=res.data;
            }
        });
        /**
         * [getEmployeeList 获取每个业者类型对应的人员]
         * @return {[type]} [description]
         */
        function getEmployeeList(employeeType){
            // http://192.168.28.78:8184/evaluate/employeeList?employeeType=1
            $http.get([$window.API.EVALUATE.EVALUATE_EMPLOYEELIST,"?employeeType=",employeeType].join("")).success(function(res){
                console.log(res)
                if(!res.deletedCode){
                    $scope.employeeIds=res.data;
                }
            });
        }
        /**
         * [业主角色-筛选]
         * @param  {[type]} employeeType [业者类型]
         */
        $scope.$watch('list.detailType',function(employeeType){
            if(employeeType!=null){
                getEmployeeList(employeeType);
            }else {
                $scope.employeeIds=[];
            }

            console.log(employeeType)
        })
        $scope.$watch('list.employeeId',function(employeeId){
            if(employeeId!==undefined){
                postData.employeeId = employeeId;
                $scope.filtering(postData);
            }
        })


        /**
         * [全选]
         */
        $scope.selectAll=false;
        $scope.grid={};
        /*模拟数据-start-*/
            /*$scope.grid.result=[
                {   id:1,
                    userName: "个巨浪",
                    content:"我的锅了归纳端分离回家了",
                    createTime:"146163464131",
                    deleted:false
                },
                {   id:2,
                    userName: "gdflh",
                    content:"哈的返回说过的很反感",
                    createTime:"146163484135",
                    deleted:false
                },

            ]
           /*模拟数据-end-*/
        $scope.all = function() {
            var cc=0;
            angular.forEach($scope.grid.result,function(value,i){
                if(value.deleted){
                    cc++;
                }
            })
            /*当deleted为真的数目=数组长度时，证明全部勾选-这时点击全选就是取消全选 */
            $scope.selectAll=$scope.grid.result.length==cc?false:!$scope.selectAll;

            angular.forEach($scope.grid.result,function(value,i){
                value.deleted=$scope.selectAll? true:false;
            })
        }
        /**
         * [删除]
         * @param  {[type]} t  [t=1删除当前，t=2删除选中]
         * @param  {[type]} dt [description]
         * @return {[type]}    [description]
         */
        $scope.del = function(t,dt) {
            var delArr = [];
                switch (t) {
                case 1:
                    delArr.push(dt);
                    break;
                case 2:
                    angular.forEach(dt,function(value,i){
                        if(value.deleted){
                            return delArr.push(value.id);
                        }
                    })
                    break;

            }
            if(!delArr.length>0){
                alert("请选中删除项！");
                return false;
            }
            var delData = {
                "ids":delArr
            }
            console.log(delArr)
            if(confirm("确定删除所选项吗？")){
                $http({"url":[$window.API.EVALUATE.EVALUATE_DELETE].join(""),method:"POST", data:delData}).success(function(res){
                    if(!res.stateCode){
                        successMsg.make({msg:"删除成功！"});
                        $scope.refresh();
                    }
                });
            }



        }





    }]);
