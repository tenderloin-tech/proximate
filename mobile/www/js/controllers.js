angular.module('proximate.controllers', [])

.controller('AppCtrl', function($ionicPlatform, $localStorage,
  $scope, $state, Settings, Events, PubNub, Beacons) {

  $scope.hide_header = true;

  // Initialize current event
  $scope.event = {
    id: null
  };

  // Gets the most current event for the user, and updates the
  // relevant checkin status, protecting for empty responses.
  $scope.initWithEvent = function() {
    Events.getMostCurrentEvent()
      .then(function(res) {
        console.log('Got current event: ' + JSON.stringify(res));
        $scope.event = res;
        $scope.setPrettyStartTime();
        return res;
      })
      .then(function(res) {
        return Events.getEventCheckinStatus($scope.event.id);
      })
      .then(function(res) {
        console.log('Checkin status is: ' + JSON.stringify(res));
        if (res) {
          $scope.event.status = res.status;
        } else {
          $scope.event.status = null;
          console.log('No data returned for checkin status');
        }
      })
      .catch(function(err) {
        console.log('getMostCurrentEvent error: ', JSON.stringify(err));

        if (err.status === 404) {
          $scope.event.id = null;
        }

      })
      .finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  // Utility function that populates the pretty time field from start time
  $scope.setPrettyStartTime = function() {
    $scope.event.pretty_time = moment($scope.event.start_time).format('h:mm a');
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

  function loadCycle() {
    $scope.initWithEvent();
    $scope.subscribeToCheckinStatus();
    Settings.updateBeaconList();
    Beacons.setupBeacons(PubNub.publish);
  }

  $ionicPlatform.ready(function() {
    if ($localStorage.get('initialized') !== 'true') {
      Settings.updateDeviceId();
      $state.go('splash');
    } else {
      loadCycle();
    }
  });

  $ionicPlatform.on('resume', loadCycle);

  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    if (fromState.name === 'splash') {
      loadCycle();
    }
  });

})

.controller('StatusCtrl', function($scope) {

  $scope.doRefresh = $scope.initWithEvent;

})

.controller('UpcomingCtrl', function($scope, Events) {

  //Instantiate empty events list
  $scope.data = {
    events: []
  };

  $scope.getUpcomingEvents = function() {
    Events.getUpcomingEvents()
      .then(function(events) {
        $scope.data.events = events;
      }).finally(function() {
        // Re-scrolls the mobile screen on
        // pull-to-refresh
        $scope.$broadcast('scroll.refreshComplete');
      });
  };

  // Pull-to-refresh functionality
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

  Settings.updateDeviceId();

  // Calls the factory signin function, and takes the user to the Status view upon success,
  // or displays an error otherwise

  $scope.register = function() {
    Settings.signin($scope.data)
      .then(function(res) {
        $scope.error = '';
        $scope.hide_header = false;
        $state.go('tab.status');
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

.controller('SettingsCtrl', function($scope, Settings, Auth) {

  angular.element(document).ready(function() {

    $scope.data = {};
    $scope.data.username = Settings.data.username;
    $scope.data.deviceId = Settings.data.deviceId;

  });

  $scope.updatePassword = function() {
    // Stem function
  };

  $scope.refreshBeacons = Settings.updateBeaconList;

  $scope.logout = function() {
    $scope.hide_header = true;
    Auth.logout();
  };
});
