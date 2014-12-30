angular.module('proximate',
  ['ui.router',
  'proximate.controllers',
  'proximate.services',
  'angularMoment'
  ])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      templateUrl: 'views/home.html',
      // controller: 'MainController',
      url: '/'
    })

    .state('event', {
      templateUrl: 'views/event.html',
      controller: 'EventCtrl',
      url: '/event'
    })

    .state('admin', {
      templateUrl: 'views/admin.html',
      controller: 'AdminCtrl',
      url: '/admin'
    });
});
