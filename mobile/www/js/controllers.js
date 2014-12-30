angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope, PubNub, Settings) {

  $scope.event = {
    id: '882',
    name: 'My Awesomest Event!',
    start_time: new Date(),
    pretty_time: '',
    status: 'notyet'
  };

  $scope.initWithEvent = function() {
    Events.getMostRecentEvent()
      .then(function(res) {
        $scope.event = res;
        $scope.prettifyStartTime();
      })
      .then(function() {
        Events.getEventCheckinStatus($scope.event.id)
        .then(function() {
          $scope.event.status = res.status;
        });
      });
  };

  $scope.subscribeToCheckinStatus = function() {
    PubNub.subscribe('checkins', function(message) {
      console.log(message);

      if (message.deviceId === Settings.data.deviceId) {
        //continue to check in the user
      }
    });
  };

  $scope.prettifyStartTime = function() {
    $scope.event.pretty_time = moment($scope.event.start_time).format('h:mm a');
  };

  $scope.prettifyStartTime();
  // $scope.initWithEvent();
  // $scope.subscribeToCheckinStatus();

})

.controller('SettingsCtrl', function($scope, Beacons, PubNub, Settings) {

  //waits for the view to load so as to not interrupt the html/css
  angular.element(document).ready(function() {

    Beacons.setupTestBeacons(PubNub.publish);

    $scope.data = Settings.data;

  });

  /* scope functions */

  $scope.updateUsername = function() {
    Settings.updateUsername($scope.data.username);
  };

});
