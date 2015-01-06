angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope, $state, PubNub, Events, Settings, Beacons) {

  // Initial test data
  $scope.event = {
    id: '882',
    name: 'Test Event',
    start_time: 'Tue, 30 Dec 2014 00:46:41 GMT',
    pretty_time: '',
    status: null
  };

  // Gets the most current event for the user, and updates the
  // relevant checkin status, protecting for empty responses.
  $scope.initWithEvent = function() {
    Events.getMostCurrentEvent()
      .then(function(res) {
        console.log('Got current event: ' + JSON.stringify(res));
        $scope.event = res;
        $scope.setPrettyStartTime();
      })
      .then(function() {
        Events.getEventCheckinStatus($scope.event.id)
        .then(function(res) {
          console.log('Checkin status is: ' + JSON.stringify(res));
          if (res) {
            $scope.event.status = res.status;
          } else {
            $scope.event.status = null;
            console.log('No data returned for checkin status');
          }
        });
      })
      .catch(function(err) {
        console.log('getMostCurrentEvent error: ' + err);
      })
      .finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  // Subscribe to the checkins channel on PubNub, checking for events
  // that match a checkin confirmation for the relevant device, then
  // change status to match
  $scope.subscribeToCheckinStatus = function() {
    PubNub.subscribe('checkins', function(message) {
      console.log('Received PubNub message: ', JSON.stringify(message));

      if (message.deviceId === Settings.data.deviceId &&
          message.eventType === 'checkinConfirm' &&
          message.eventId == $scope.event.id) {
        console.log('Setting status: ' + message.checkinStatus);
        //apply scope in callback so as to not lose reference
        $scope.$apply(function() {
          $scope.event.status = message.checkinStatus;
        });
      }
    });
  };

  $scope.doRefresh = function() {
    $scope.initWithEvent();
  };

  // Utility function that populates the pretty time field from start time
  $scope.setPrettyStartTime = function() {
    $scope.event.pretty_time = moment($scope.event.start_time).format('h:mm a');
  };

  // Wait for load, then full initialize cycle
  $scope.$on('$stateChangeSuccess', function() {
    $scope.setPrettyStartTime();
    $scope.initWithEvent();
    $scope.subscribeToCheckinStatus();
    Beacons.setupTestBeacons(PubNub.publish);
  });

})

.controller('UpcomingControl', function($scope, Events) {

  $scope.data = {
    events: [{"id":1,"name":"Test Kickoff","start_time":"2014-12-28T17:00:00.000Z","admin_id":1,"_pivot_id":63,"_pivot_participant_id":3,"_pivot_event_id":1},{"id":2,"name":"Kickoff","start_time":"2014-12-29T17:00:00.000Z","admin_id":1,"_pivot_id":64,"_pivot_participant_id":3,"_pivot_event_id":2},{"id":3,"name":"Kickoff","start_time":"2014-12-30T17:00:00.000Z","admin_id":1,"_pivot_id":65,"_pivot_participant_id":3,"_pivot_event_id":3},{"id":4,"name":"Kickoff","start_time":"2015-01-02T17:00:00.000Z","admin_id":1,"_pivot_id":66,"_pivot_participant_id":3,"_pivot_event_id":4},{"id":5,"name":"Kickoff","start_time":"2015-01-03T17:00:00.000Z","admin_id":1,"_pivot_id":67,"_pivot_participant_id":3,"_pivot_event_id":5},{"id":6,"name":"Kickoff","start_time":"2015-01-05T17:00:00.000Z","admin_id":1,"_pivot_id":68,"_pivot_participant_id":3,"_pivot_event_id":6},{"id":7,"name":"Kickoff","start_time":"2015-01-06T17:00:00.000Z","admin_id":1,"_pivot_id":69,"_pivot_participant_id":3,"_pivot_event_id":7},{"id":8,"name":"Kickoff","start_time":"2015-01-07T17:00:00.000Z","admin_id":1,"_pivot_id":70,"_pivot_participant_id":3,"_pivot_event_id":8},{"id":9,"name":"Kickoff","start_time":"2015-01-08T17:00:00.000Z","admin_id":1,"_pivot_id":71,"_pivot_participant_id":3,"_pivot_event_id":9},{"id":10,"name":"Kickoff","start_time":"2015-01-09T17:00:00.000Z","admin_id":1,"_pivot_id":72,"_pivot_participant_id":3,"_pivot_event_id":10}]
  };

  // Functions stemmed for now --

  $scope.getUpcomingEvents = function() {
    Events.getUpcomingEvents()
      .then(function(res) {
        $scope.raw_data = res;
      }).finally(function(res) {
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  $scope.doRefresh = function() {
    $scope.getUpcomingEvents();
  };

  $scope.$on('$stateChangeSuccess', function() {
    $scope.getUpcomingEvents();
  });
})

// Controls the splash screen for user signin on mobile

.controller('SplashCtrl', function($scope, $state, Settings) {

  // Initialize data objects

  $scope.data = {
    username: '',
    password: '',
    deviceId: ''
  };

  $scope.error = '';

  // Calls the factory signin function, and takes the user to the Status view upon success,
  // or displays an error otherwise

  $scope.register = function() {
    Settings.signin($scope.data)
      .then(function(res) {
        $scope.error = '';
        $state.go('tab.status', {}, {reload: true});
      })
      .catch(function(err) {
        $scope.logSplashError(err);
      });
  };

  $scope.logSplashError = function(err) {
    if (err.status === 404) {
      $scope.error = 'We couldn\'t find you in the system. Please contact your administrator.';
    } else if (err.status === 0) {
      $scope.error = 'Could not contact Proximate server. Please try again later.';
    } else {
      $scope.error = 'Unknown error: ' + JSON.stringify(err);
    }
  };

})

.controller('SettingsCtrl', function($scope, Settings) {

  angular.element(document).ready(function() {

    $scope.data = {};
    $scope.data.username = Settings.data.username;
    $scope.data.deviceId = Settings.data.deviceId;

  });

  $scope.updatePassword = function() {
    // Stem function
  };

});
