angular.module('proximate.services')

.factory('Beacons', function($localStorage, Settings) {

  // Sets up beacon environment and calls functions to begin monitoring / ranging
  //the beacon list
  var setupTestBeacons = function(onEnterCallback) {
    setupDelegate(onEnterCallback);

    // request auth from the user
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    startMonitoringRegions();
    startRangingRegions();
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
          eventType: 'didEnterRegion'
        };

        onEnterCallback('checkins', regionInfo);
        // Settings.logToDom('[Prox] didEnterRegion:' + JSON.stringify(pluginResult));

      } else if (pluginResult.state === 'CLRegionStateOutside') {
        console.log('Exited the region!');
      }
    };

    delegate.didStartMonitoringForRegion = function(pluginResult) {
      Settings.logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
    };

    delegate.didRangeBeaconsInRegion = function(pluginResult) {

      var rangingInfo = {
        deviceId: Settings.data.deviceId,
        username: Settings.data.username,
        beacons: pluginResult.beacons,
        eventType: 'didRangeBeaconsInRegion'
      };

      onEnterCallback('ranging', rangingInfo);
      // Settings.logToDom('[Prox] Beacon 0 Accuracy: ' + JSON.stringify(pluginResult.beacons[0].accuracy));
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
});
