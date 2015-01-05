angular.module('proximate.services')

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
    } else if (ionic.Platform.isAndroid()) {
      data.deviceId = device.uuid;
      $localStorage.set('deviceId', data.deviceId);
    }
  };

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

  var signin = function(info) {
    // Set user input from splash screen to localStorage
    // then initialize Settings variables as well
    $localStorage.set('email', info.email);
    data.email = info.email;
    $localStorage.set('password', info.password);
    data.password = info.password;
    $localStorage.set('initialized', 'true');

    // Signs in, and returns a promise, setting the user's username and ID on success
    return $http({
      method: 'POST',
      url: webServer.url + '/api/signin',
      data: {
        email: info.email,
        password: info.password,
        deviceId: data.deviceId
      }
    }).then(function(res) {
      if (res.data.name) {
        $localStorage.set('username', res.data.name);
        data.username = res.data.name;
      }
      if (res.data.id) {
        $localStorage.set('userId', res.data.id);
        data.userId = res.data.id;
      }
      return res.data;
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
    checkServerStatus: checkServerStatus,
    signin: signin
  };

});
