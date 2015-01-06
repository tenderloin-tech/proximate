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
    events: []
  };

  // Functions stemmed for now --

  $scope.getUpcomingEvents = function() {
    Events.getUpcomingEvents()
      .then(function(events) {
        $scope.data.events = events;
      }).finally(function() {
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
