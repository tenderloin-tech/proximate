angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // jscs: disable maximumLineLength
  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://pbs.twimg.com/profile_images/479740132258361344/KaYdH9hE.jpeg'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  // Some fake testing data
  var friends = [{
    id: 0,
    name: 'Ben Sparrow',
    notes: 'Enjoys drawing things',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    notes: 'Odd obsession with everything',
    face: 'https://pbs.twimg.com/profile_images/479740132258361344/KaYdH9hE.jpeg'
  }, {
    id: 2,
    name: 'Andrew Jostlen',
    notes: 'Wears a sweet leather Jacket. I\'m a bit jealous',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    notes: 'I think he needs to buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    notes: 'Just the nicest guy',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

  // jscs: enable maximumLineLength
  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})

.factory('Beacons', function(){

  // Utility logging function. Currently set to log to settings screen on app for DEV purposes

  var logToDom = function (message) {
      var e = document.createElement('label');
      e.innerText = message;

      var devMsgElement = document.getElementById("dev-messages");

      var br = document.createElement('br');
      var br2 = document.createElement('br');
      devMsgElement.appendChild(e);
      devMsgElement.appendChild(br);
      devMsgElement.appendChild(br2);

      //window.scrollTo(0, window.document.height);
  };

  // This function is currently configured to work with one single iBeacon - change to use multiple

  var setupTestBeacons = function(){

    var delegate = new cordova.plugins.locationManager.Delegate();

    //provide logging for state changes

    delegate.didDetermineStateForRegion = function (pluginResult) {

        if (pluginResult.state === "CLRegionStateInside"){
          console.log('Entered the region!');
        } else if (pluginResult.state === "CLRegionStateOutside") {
          console.log('Exited the region!');
        }
    };

    //This handler will be called when we enter the specified region, including when the app is backgrounded.

    delegate.didEnterRegion = function(pluginResult){
      logToDom("[Proximate] Entered region with result" + JSON.stringify(pluginResult));
    }

    delegate.didStartMonitoringForRegion = function (pluginResult) {
        console.log('didStartMonitoringForRegion:', JSON.stringify(pluginResult));
        logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
    };

    delegate.didRangeBeacons = function (pluginResult) {
        cordova.plugins.locationManager.appendToDeviceLog("moo" + JSON.stringify(pluginResult));
        logToDom('Accuracy: ' + JSON.stringify(pluginResult.beacons[0].accuracy));
    };

    var uuid = 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0';
    var identifier = 'Apple AirLocate E2C56DB5';
    var minor = 1000;
    var major = 5;
    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

    cordova.plugins.locationManager.setDelegate(delegate);

    // request auth from the user
    cordova.plugins.locationManager.requestAlwaysAuthorization();

    cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
        .fail(console.error)
        .done();

    //ranging

    // cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
    //     .fail(console.error)
    //     .done();

    cordova.plugins.locationManager.getAuthorizationStatus().then();

  }

  return {
    setupTestBeacons: setupTestBeacons,
  }

})

.factory('PubNub', function(){
})

.factory('Settings', function(){

  var userName = ""; //set to persistent data when available

  var currentBeaconList = []; //also to be set to persistent

  return {
    userName: userName
  }

});
