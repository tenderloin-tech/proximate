angular.module('proximate.controllers', [])

.controller('AdminCtrl', function($scope, Populate, PubNub) {
  // initial http request to server for attendees
  $scope.attendees = [];
  $scope.getAttendees = function() {
    $scope.attendees = Populate.getAttendeeList();
  };

  // handle presence events
  $rootScope.$on(PubNub.ngPrsEv(my_channel), function(event, payload) {
    $scope.getAttendees();
    // payload contains message, channel, env...
    console.log('got a presence event:', payload);
  });
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
