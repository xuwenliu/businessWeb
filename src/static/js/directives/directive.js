/**
 *
 */
sysApp.directive('onMenusFinished', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatMenu');
                });
            }
        }
    };
});

sysApp.directive('onBrandsFinished', function ($timeout) {
    return {
        restrict: 'A',
        link: function(scope) {
            if (scope.$last === true) {
                $timeout(function() {
                    scope.$emit('ngRepeatBrand');
                });
            }
        }
    };
});