angular.module('proximate.controllers', [])

.controller('AdminCtrl', function() {

})

.controller('EventCtrl', function($scope) {

  var updateClock = function() {
    $scope.clock = new Date();
  };

  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();

});
