
/**
 *首页 > 统计概况
 */
sysController.controller("DefaultController", ["$scope", "$http", "$window", "$cookieStore","$timeout",  "$grid",
    function ($scope, $http, $window, $cookieStore, $timeout, $grid) {

        $http.get([window.API.DEFAULT.DEFAULT_COUNT].join("")).success(function(res){
            if(!res.stateCode){
                $scope.defInfo=res.data;
                $scope.defInfo.logoImage=res.data.logoImage+window.IMG60x60;
            }
        })

    }]);
