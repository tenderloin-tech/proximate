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
      url: '/admin',
      controller: function($state) {
        $state.transitionTo('admin.events');
      }
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

    .state('admin.currentRoster', {
      templateUrl: 'views/partials/roster.template.html',
      controller: 'RosterCtrl',
      url: '/events/current/roster'
    })

    .state('admin.beaconsSummary', {
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
      templateUrl: 'views/projectorView.html',
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

.run(function($rootScope, PubNub, Populate) {
  $rootScope.data = {};
  $rootScope.data.currentEventParticipants = [];

  // Fetch the participant and event data from the server
  Populate.getCurrentEvent(Populate.adminId).then(function(eventData) {
    $rootScope.data.currentEvent = eventData.data;
    return Populate.getParticipants(eventData.data.id);
  }).then(function(participantData) {
    $rootScope.data.currentEventParticipants = participantData.data[0].participants;
  }).catch(function(err) {
    console.log(err);
  });

  // Fetch admin name for a given adminId
  Populate.getAdminName(Populate.adminId).then(function(adminInformation) {
    $rootScope.adminInformation = adminInformation;
  });

  $rootScope.arrivedParticipants = [];
  // Listen for checkin confirmations and add these to arrivedParticipants
  PubNub.subscribe('checkins', function(message) {
    if (message.eventType === 'checkinConfirm') {
      $rootScope.arrivedParticipants.push({
        id: message.participantId,
        status: message.checkinStatus
      });
      // Find the correct participant in participantData and update their status
      $rootScope.$apply($rootScope.data.currentEventParticipants.some(function(participant) {
        if (participant.id === message.participantId) {
          console.log('Setting status :', message);
          participant._pivot_status = message.checkinStatus;
          return true;
        }
      }));
    }
  });
});
