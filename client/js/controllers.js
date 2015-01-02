angular.module('proximate.controllers', [])

.controller('AdminCtrl', function() {

})

.controller('EventCtrl', function($scope) {

  // $scope.fakeEvent = '2015-1-2T18:00:00.000Z';

  var updateClock = function() {
    $scope.clock = new Date();
  };

  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();

});
