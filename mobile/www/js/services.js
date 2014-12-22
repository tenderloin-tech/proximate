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

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
    // jscs: enable requireCamelCaseOrUpperCaseIdentifiers
  });

  var publish = function(channel, message) {
    info = {
      channel: channel,
      message: message
    };

    pubNub.publish(info);
  };

  return {
    publish: publish
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

    //window.scrollTo(0, window.document.height);
  };

  // This function is currently configured to work with one single iBeacon - change to use multiple

  var setupTestBeacons = function(onEnterCallback) {

    var delegate = new cordova.plugins.locationManager.Delegate();

    //provide logging for state changes

    delegate.didDetermineStateForRegion = function(pluginResult) {

      if (pluginResult.state === 'CLRegionStateInside') {
        console.log('Entered the region!');
      } else if (pluginResult.state === 'CLRegionStateOutside') {
        console.log('Exited the region!');
      }
    };

    //This handler will be called when we enter the specified region, including when the app is backgrounded.

    delegate.didEnterRegion = function(pluginResult) {

      var regionInfo = {
        deviceId: $localStorage.get('deviceId'),
        username: $localStorage.get('username'),
        region: pluginResult.region,
        eventType: pluginResult.eventType
      };

      onEnterCallback(regionInfo);

      logToDom('[Prox] didEnterRegion:' + JSON.stringify(pluginResult));
    };

    delegate.didStartMonitoringForRegion = function(pluginResult) {
      console.log('didStartMonitoringForRegion:', JSON.stringify(pluginResult));
      logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
    };

    delegate.didRangeBeacons = function(pluginResult) {
      console.log('moo' + JSON.stringify(pluginResult));
      logToDom('Accuracy: ' + JSON.stringify(pluginResult.beacons[0].accuracy));
    };

    var beaconRegion = Settings.currentBeaconList;

    cordova.plugins.locationManager.setDelegate(delegate);

    // request auth from the user
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
        .fail(console.error)
        .done();

    //ranging - reenable after V0 when rangefinding is necessary

    // cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
    //     .fail(console.error)
    //     .done();

    // cordova.plugins.locationManager.getAuthorizationStatus().then();

  };

  return {
    setupTestBeacons: setupTestBeacons
  };
})

.factory('Settings', function() {

  //testing data
  var uuid = 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0';
  var identifier = 'Apple AirLocate E2C56DB5';
  var minor = 1000;
  var major = 5;

  // jscs: disable maximumLineLength
  var testBeacon = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
  // jscs: enable maximumLineLength

  var currentBeaconList = testBeacon; //also to be set to persistent

  return {
    currentBeaconList: currentBeaconList
  };

});
