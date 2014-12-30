angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope, $state, PubNub, Events, Settings) {

  // Initial test data
  $scope.event = {
    id: '882',
    name: 'My Awesomest Event!',
    start_time: 'Tue, 30 Dec 2014 00:46:41 GMT',
    pretty_time: '',
    status: null
  };

  // Gets the most current event for the user, and updates the
  // relevant checkin status, protecting for empty responses.
  $scope.initWithEvent = function() {
    Events.getMostCurrentEvent()
      .then(function(res) {
        console.log('Event Stuffs: ' + JSON.stringify(res));
        $scope.event = res;
        $scope.prettifyStartTime();
      })
      .then(function() {
        Events.getEventCheckinStatus($scope.event.id)
        .then(function(res) {
          console.log('Checkin Status is: ' + JSON.stringify(res));
          if (res) {
            $scope.event.status = res.status;
          } else {
            $scope.event.status = null;
            console.log('No data returned for checkin status');
          }
        });
      })
      .catch(function(err){
        console.log('getMostCurrentEvent error: ' + err);
      });
  };

  // Subscribe to the checkins channel on PubNub, checking for events
  // that match a checkin confirmation for the relevant device, then
  // change status to match
  $scope.subscribeToCheckinStatus = function() {
    PubNub.subscribe('checkins', function(message) {
      console.log(message);

      if (message.deviceId === Settings.data.deviceId
          && message.eventType === 'checkinConfirm') {
        console.log('Setting status: ' + message.checkinStatus);
        $scope.event.status = message.checkinStatus;
        $state.go($state.current, {}, {reload: true});
      }
    });
  };

  // Utility function that populates the pretty time field from start time
  $scope.prettifyStartTime = function() {
    $scope.event.pretty_time = moment($scope.event.start_time).format('h:mm a');
  };

  //wait for load, then full initialize cycle
  angular.element(document).ready(function() {
    $scope.prettifyStartTime();
    $scope.initWithEvent();
    $scope.subscribeToCheckinStatus();
  });

})

.controller('SettingsCtrl', function($scope, Beacons, PubNub, Settings) {

  //waits for the view to load so as to not interrupt the html/css
  angular.element(document).ready(function() {

    Beacons.setupTestBeacons(PubNub.publish);

    $scope.data = Settings.data;

  });

  $scope.updateUsername = function() {
    Settings.updateUsername($scope.data.username);
  };

});
