angular.module('proximate.services', [])

// Storage factory, uses window.localStorage
// Includes methods for storing objects
.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}])

.factory('Events', function($http, Settings) {
  var getMostCurrentEvent = function() {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/events/current'
    }).then(function(res) {
      return JSON.parse(res);
    });
  };

  var getEventCheckinStatus = function(eventId) {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/participants/status/' + data.deviceId + '/' + eventId
    }).then(function(res) {
      return JSON.parse(res)[0];
    });
  };

  return {
    getMostCurrentEvent: getMostCurrentEvent,
    getEventCheckinStatus: getEventCheckinStatus
  };
})

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
  });

  var publish = function(channel, message) {
    var info = {
      channel: channel,
      message: message,
      callback: function(res) {
        console.log('Publish successful ', res);
      }
    };

    pubNub.publish(info);
  };

  var subscribe = function(channel, callback) {
    pubNub.subscribe({
      channel: channel,
      callback: callback
    });
  };

  return {
    publish: publish,
    subscribe: subscribe
  };
})

.factory('Beacons', function($localStorage, Settings) {

  // Utility logging function. Currently set to log to settings screen on app for DEV purposes

  var logToDom = function(message) {
    var e = document.createElement('label');
    e.innerText = message;

    var devMsgElement = document.getElementById('dev-messages');

    var br = document.createElement('br');
    var br2 = document.createElement('br');
    devMsgElement.appendChild(e);
    devMsgElement.appendChild(br);
    devMsgElement.appendChild(br2);
  };

  // Sets up beacon environment and calls functions to begin monitoring / ranging
  //the beacon list
  var setupTestBeacons = function(onEnterCallback) {
    setupDelegate(onEnterCallback);

    // request auth from the user
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    startMonitoringRegions();
  };

  // Begins monitoring for all regions, as specified in the beacon list
  var startMonitoringRegions = function() {
    var currentRegions = regionsFromBeacons(Settings.data.currentBeaconList);

    currentRegions.forEach(function(region) {
      cordova.plugins.locationManager.startMonitoringForRegion(region)
        .fail(console.error)
        .done();
    });
  };

  // Begins monitoring for all regions, as specified in the beacon list
  var startRangingRegions = function() {
    var currentRegions = regionsFromBeacons(Settings.data.currentBeaconList);

    currentRegions.forEach(function(region) {
      cordova.plugins.locationManager.startRangingBeaconsInRegion(region)
        .fail(console.error)
        .done();
    });
  };

  // Sets event callbacks and attaches them to a 'delegate' object to be called
  //when that event is triggered.
  var setupDelegate = function(onEnterCallback) {
    // Our delegate object, which is a container for event callbacks
    var delegate = new cordova.plugins.locationManager.Delegate();

    // Subsumes the didEnterRegion handler, which
    // will be called when we enter the specified region,
    // including when the app is backgrounded.
    delegate.didDetermineStateForRegion = function(pluginResult) {

      if (pluginResult.state === 'CLRegionStateInside') {
        console.log('Entered the region!');

        var regionInfo = {
          deviceId: Settings.data.deviceId,
          username: Settings.data.username,
          region: pluginResult.region,
          eventType: pluginResult.eventType
        };

        onEnterCallback('checkins', regionInfo);
        logToDom('[Prox] didEnterRegion:' + JSON.stringify(pluginResult));

      } else if (pluginResult.state === 'CLRegionStateOutside') {
        console.log('Exited the region!');
      }
    };

    delegate.didStartMonitoringForRegion = function(pluginResult) {
      // console.log('didStartMonitoringForRegion:', JSON.stringify(pluginResult));
      logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
    };

    delegate.didRangeBeacons = function(pluginResult) {
      console.log('moo' + JSON.stringify(pluginResult));
      logToDom('Accuracy: ' + JSON.stringify(pluginResult.beacons[0].accuracy));
    };

    cordova.plugins.locationManager.setDelegate(delegate);
  };

  // Utility function that parses a JSON beacon list, and turns it into
  //region objects that the locationManager plugin can monitor/range

  var regionsFromBeacons = function(beaconListAsJSON) {
    var list = JSON.parse(beaconListAsJSON);
    var regionList = [];

    list.forEach(function(beacon) {
      var region = new cordova.plugins.locationManager.BeaconRegion(
        beacon.identifier,
        beacon.uuid,
        beacon.major,
        beacon.minor);
      regionList.push(region);
    });

    return regionList;
  };

  return {
    setupTestBeacons: setupTestBeacons
  };
})

.factory('Settings', function($localStorage, $http, webServer) {

  // Container object for settings values, needed for syncing across controllers
  // Exposes the following: data.deviceId, data.username, data.currentBeaconList

  var data = {};

  data.deviceId = $localStorage.get('deviceId'); //initialize with stored value

  // update the deviceID based on current device
  var updateDeviceId = function() {
    if (ionic.Platform.isIOS()) {
      window.IDFVPlugin.getIdentifier(
        // on success, set deviceId in memory and localstorage
        function(result) {
          console.log('Setting deviceId: ' + result);
          data.deviceId = result;
          $localStorage.set('deviceId', data.deviceId);
        // on failure, simlpy output the error to the console
        // this will cause us to use the default test value / whatever is stored in localStorage
        }, function(error) {
          console.log(error);
        });
    }
  };

  // updateDeviceId();

  data.currentBeaconList = $localStorage.get('beaconList');

  // Gets the most recent beacons from the server, populating local storage
  //on success

  var updateBeaconList = function() {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/beacons/' + data.deviceId,
    }).then(function(result) {
      data.currentBeaconList = result;
      localStorage.set('beaconList', result);
    });
  };

  //initializes the username property from localStorage
  data.username = $localStorage.get('username');

  //sets username both in localStorage and on the server
  var updateUsername = function(name) {
    $localStorage.set('username', name);

    return $http({
      method: 'POST',
      url: webServer.url + '/api/devices/register',
      data: {
        username: name,
        deviceId: data.deviceId,
      }
    }).then(function(data) {
      console.log(data);
    }).catch(function(err) {
      console.log(err);
    });
  };

  // Gets participant id, name, and deviceId from server
  var updateParticipantInfo = function() {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/participants/devices/' + data.deviceId
    }).then(function(res) {
      var parsed = JSON.parse(res);
      if (parsed.id) {
        data.participantId = parsed.id;
      }
    });
  };

  var checkServerStatus = function() {
    return $http({
      method: 'GET',
      url: webServer.url + '/'
    }).then(function(res) {
      return res;
    }).catch(function(err) {
      return 'err';
    });
  };

  return {
    data: data,
    updateDeviceId: updateDeviceId,
    updateBeaconList: updateBeaconList,
    updateUsername: updateUsername,
    updateParticipantInfo: updateParticipantInfo,
    checkServerStatus: checkServerStatus
  };

});
