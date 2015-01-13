angular.module('proximate',
  ['ui.router',
  'proximate.auth',
  'proximate.controllers',
  'proximate.services',
  'angularMoment',
  'ngAnimate',
  'ngTable'
  ])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
  $urlRouterProvider.otherwise('/admin/events');

  $stateProvider

    .state('admin', {
      templateUrl: 'views/admin.html',
      url: '/admin'
    })

    .state('admin.events', {
      templateUrl: 'views/partials/events.template.html',
      controller: 'EventsCtrl',
      url: '/events'
    })

    .state('admin.roster', {
      templateUrl: 'views/partials/roster.template.html',
      controller: 'RosterCtrl',
      url: '/events/:eventId/roster'
    })

    .state('admin.beacons', {
      templateUrl: 'views/partials/beacons.template.html',
      controller: 'BeaconsCtrl',
      url: '/beacons'
    })

    .state('admin.participant', {
      templateUrl: 'views/partials/participant.template.html',
      controller: 'ParticipantCtrl',
      url: '/participant/:participantId'
    })

    .state('projector', {
      templateUrl: 'views/projector.html',
      controller: 'ProjectorCtrl',
      url: '/projector'
    })

    .state('login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl',
      url: '/login'
    });

  $httpProvider.interceptors.push('authInterceptor');
})

.run(function($rootScope, $state, Auth, PubNub, Populate) {
  // Redirect to login if user is not authenticated
  $rootScope.$on('$stateChangeStart', function(event, next) {
    if (next.name !== 'login' && !Auth.isAuth()) {
      event.preventDefault();
      $state.transitionTo('login');
    }
  });
});
