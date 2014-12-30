angular.module('proximate.controllers', [])

.controller('AdminCtrl', function($scope, Populate, PubNub) {
  $scope.participants = {};
  $scope.currentEvent = {};

  angular.extend($scope, Populate);

  $scope.getCurrentEvent(function(eventData) {
    $scope.getParticipants(eventData.data.id,
      function(participantData) {
        $scope.participantData = participantData.data;
        console.log($scope.participantData);
    });
  })

  PubNub.subscribe('checkins', function(message) {
    console.log(message);
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
