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
  $urlRouterProvider.otherwise('/events');

  $stateProvider
    .state('projector', {
      templateUrl: 'views/projectorView.html',
      controller: 'ProjectorCtrl',
      url: '/projector'
    })

    .state('roster', {
      templateUrl: 'views/roster.html',
      controller: 'RosterCtrl',
      url: '/events/:eventId/roster'
    })

    .state('currentRoster', {
      templateUrl: 'views/roster.html',
      controller: 'RosterCtrl',
      url: '/events/current/roster'
    })

    .state('events', {
      templateUrl: 'views/events.html',
      controller: 'EventsCtrl',
      url: '/events'
    })

    .state('participant', {
      templateUrl: 'views/participant.html',
      controller: 'ParticipantCtrl',
      url: '/participant/:participantId'
    })

    .state('beaconsSummary', {
      templateUrl: 'views/beacons.html',
      controller: 'BeaconsCtrl',
      url: '/beacons'
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
