angular.module('proximate',
  ['ui.router',
  'proximate.controllers',
  'proximate.services'
  // 'pubnub.angular.service'
  ])

.run(function(PubNub) {
  // PubNub.subscribe('checkins');
  // console.log('pubnub in client app', PubNub);
  // console.log('publish in run', PubNub.publish);
  // console.log('subscribe in run', PubNub.subscribe);
  // setTimeout(function(){
  //   PubNub.publish('checkins', {
  //     deviceId: 'deviceId',
  //     username: 'username',
  //     region: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
  //     eventType: 'enterRegion'
  //   });
  // }, 10000);
  // change to just invoking function to grab list of attendees
})

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
