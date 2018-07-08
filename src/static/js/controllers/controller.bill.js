/**
 * order
 *
 *账单管理 > 账单列表
 */

sysController.controller("BillListController", ["$scope", "$http", "$window","$grid","$dateTool","$filter","$getSelectTypes",
    function($scope, $http, $window,$grid,$dateTool,$filter,$getSelectTypes) {

        /* 列表 */
        $grid.initial($scope, [$window.API.BILL.BILL_LIST].join(""), {"billType":''});

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
            if (dt!==undefined) {
                postData.billContentType = dt;
                $scope.filtering(postData);
            }
        });

        /*账单状态选择*/
        $scope.$watch('list.status',function(dt){
            if (dt!==undefined) {
                postData.status = dt;
                $scope.filtering(postData);
            }
        });

        $scope.submitSearch = function(dt) {
            if(dt){
                postData.billNumQueryKey = dt.billNumQueryKey;
                postData.customerNameQueryKey = dt.customerNameQueryKey;
                postData.customerPhoneQueryKey = dt.customerPhoneQueryKey;
                $scope.filtering(postData);
            }
        }
    }]);