angular.module('proximate.controllers', [])

.controller('AdminCtrl', function($scope, Populate, PubNub) {
  $scope.participants = {};
  $scope.currentEvent = {};

  angular.extend($scope, Populate);

  $scope.getCurrentEvent(function(eventData) {
    $scope.eventData = eventData;
    console.log('eventData', eventData);
    $scope.getParticipants(eventData.data.id, function(participantData) {
      $scope.participantData = participantData;
      console.log($scope.participantData);
    });
  });

  PubNub.subscribe('checkins', function(message) {
    console.log(message);
    // push to array
    // use array in custom filter
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
