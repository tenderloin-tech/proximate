angular.module('proximate', ['ionic',
  'proximate.controllers',
  'proximate.services'])

.run(function($ionicPlatform, $localStorage) {
  // Until settings view is built, store default username and deviceID
  $localStorage.set('username', 'Valentyn Boginskey');
  $localStorage.set('deviceId', '123456789');

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
