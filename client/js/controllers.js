angular.module('proximate.controllers', [a])

.controller('AdminCtrl', function($scope) {
  // initial http request to server for attendees
  // on pubnub event update view
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
