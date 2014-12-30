angular.module('proximate.controllers', [])

.controller('AdminCtrl', function($scope, Populate, PubNub) {
  // initial http request to server for attendees
  $scope.participants = [];
  $scope.currentEvent = {};

  $scope.getCurrentEvent = function() {
    $scope.currentEvent = Populate.getCurrentEvent();
  };

  $scope.getParticipants = function() {
    $scope.participants = Populate.getParticipants();
  };

  console.log('publish in admin ctrl', PubNub.subscribe);
  // PubNub.publish('checkins', {
  //     deviceId: 'WOWOWOWOW',
  //     username: 'username',
  //     region: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
  //     eventType: 'enterRegion'
  // });

  PubNub.subscribe('checkins', function(message) {
    console.log(message);
  });

  $scope.getCurrentEvent();
  console.log('currentEvent', $scope.currentEvent);
  // handle presence events
  // $rootScope.$on(PubNub.ngPrsEv(my_channel), function(event, payload) {
    // $scope.getAttendees();
    // payload contains message, channel, env...
    // console.log('got a presence event:', payload);
  // });
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
