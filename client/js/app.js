angular.module('proximate',
  ['ui.router',
  'pubnub.angular.service',
  'proximate.controllers'])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      templateUrl: 'views/home.html',
      controller: 'MainController',
      url: '/'
    });
});
