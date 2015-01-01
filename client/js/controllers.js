angular.module('proximate.controllers', [])

.controller('AdminCtrl', function() {

})

.controller('EventCtrl', function($scope) {

  $scope.fakeEvent1 = '2014-12-31T23:00:00.000Z';
  $scope.fakeEvent2 = '2014-12-31T25:00:00.000Z';

  var updateClock = function() {
    $scope.clock = new Date();
  };

  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();

});
