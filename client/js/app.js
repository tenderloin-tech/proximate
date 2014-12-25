angular.module('proximate',
  ['ui.router',
  'proximate.controllers',
  'proximate.services',
  // not sure below line is for, lets review
  'pubnub.angular.service'
  ])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      templateUrl: 'views/home.html',
      controller: 'MainController',
      url: '/'
    })

    .state('event', {
      templeteUrl: 'views/event.html',
      controller: 'EventCtrl',
      url: '/event'
    })

    .state('admin', {
      templeteUrl: 'views/admin.html',
      controller: 'AdminCtrl',
      url: '/admin'
    });
});
