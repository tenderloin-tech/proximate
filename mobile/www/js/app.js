angular.module('proximate', ['ionic',
  'proximate.controllers',
  'proximate.services'])

.run(function($ionicPlatform, $localStorage, PubNub) {
  // Until settings view is built, store default username and deviceID
  $localStorage.set('username', 'Valentyn Boginskey');
  $localStorage.set('deviceId', '123456789');

  // Similarly, add fake region array to localStorage to simulate previous info
  var testRegions = [{
    uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    identifier : 'Estimote Icy One',
    minor : 10907,
    major : 23516
  }, {
    uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    identifier : 'Estimote Blue One',
    minor : 50306,
    major : 54690
  }, {
    uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    identifier : 'Estimote Mint One',
    minor : 3704,
    major : 57868
  }];

  $localStorage.set('beaconList', JSON.stringify(testRegions));

  // Send fake enter region event, for testing
  setTimeout(function() {
    PubNub.publish('checkins', {
      deviceId: $localStorage.get('deviceId'),
      username: $localStorage.get('username'),
      region: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
      eventType: 'enterRegion'
    });
  }, 10000);

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'views/tabs.html'
    })

    .state('tab.status', {
      url: '/status',
      views: {
        'status': {
          templateUrl: 'views/status.html',
          controller: 'StatusCtrl'
        }
      }
    })

    .state('tab.settings', {
      url: '/settings',
      views: {
        'settings': {
          templateUrl: 'views/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/status');

});
