angular.module('proximate.controllers', [])

.controller('AdminCtrl', function($scope, Populate, PubNub) {
  angular.extend($scope, Populate);

  $scope.newCheckins = [];

  $scope.getCurrentEvent(function(eventData) {
    $scope.eventData = eventData;
    // console.log('eventData', eventData);
    $scope.getParticipants(eventData.data.id, function(participantData) {
      $scope.participantData = participantData.data[0].participants;
      // console.log($scope.participantData);
    });
  });

  PubNub.subscribe('checkins', function(message) {
    // console.log(message);
    $scope.newCheckins.push(message.username);
    // use array in custom filter
  });

})

.controller('EventCtrl', function($scope, Populate, PubNub) {

  $scope.newCheckins = [];

  var updateClock = function() {
    $scope.clock = new Date();
  };

  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();

  angular.extend($scope, Populate);

  $scope.getCurrentEvent(function(eventData) {
    $scope.eventData = eventData;
    // console.log('eventData', eventData);
    $scope.getParticipants(eventData.data.id, function(participantData) {
      $scope.participantData = participantData.data[0].participants;
      // console.log($scope.participantData);
    });
  });

  PubNub.subscribe('checkins', function(message) {
    // console.log(message);
    $scope.newCheckins.push(message.username);
    // use array in custom filter
  });

});
