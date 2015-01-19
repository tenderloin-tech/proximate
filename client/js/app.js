angular.module('proximate',
  ['ui.router',
  'proximate.auth',
  'proximate.controllers',
  'proximate.services',
  'angularMoment',
  'ngAnimate'
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
      url: '/events/:eventId/projector'
    })

    .state('login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl',
      url: '/login'
    });

  $httpProvider.interceptors.push(function($q, $injector) {
    var $http;
    var rootScope;

    return {
      request: function(config) {
        rootScope = rootScope || $injector.get('$rootScope');
        rootScope.$broadcast('ajax-loading');

        return config;
      },

      response: function(response) {
        $http = $http || $injector.get('$http');

        if ($http.pendingRequests.length === 0) {
          rootScope = rootScope || $injector.get('$rootScope');
          rootScope.$broadcast('ajax-success');
        }

        return response;
      },

      responseError: function(rejection) {
        $http = $http || $injector.get('$http');

        if ($http.pendingRequests.length === 0) {
          rootScope = rootScope || $injector.get('$rootScope');
          rootScope.$broadcast('ajax-success');
        }

        return $q.reject(rejection);
      }
    };
  });

  $httpProvider.interceptors.push('authInterceptor');
})

.run(function($rootScope, $state, Auth) {
  // Redirect to login if user is not authenticated
  $rootScope.$on('$stateChangeStart', function(event, next) {
    if (next.name !== 'login' && !Auth.isAuth()) {
      event.preventDefault();
      $rootScope.next = next.name;
      $state.transitionTo('login');
    }
  });
});
