angular.module('proximate',
  ['ui.router',
  'proximate.controllers',
  'proximate.services',
  'pubnub.angular.service'
  ])

.run(function(PubNub) {
  PubNub.subscribe(my_channel);
  PubNub.publish(my_channel, 'start');
})

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
