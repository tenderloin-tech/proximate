angular.module('proximate',
  ['ui.router',
  'proximate.controllers',
  'proximate.services',
  'angularMoment',
  'ngAnimate',
  'ngTable'
  ])

.config(function($stateProvider, $urlRouterProvider) {
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
      url: '/roster'
    })

    .state('events', {
      templateUrl: 'views/events.html',
      controller: 'EventsCtrl',
      url: '/events'
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
})

.run(function($rootScope, PubNub, Populate) {
  $rootScope.participantData = [];

  $rootScope.getEvent = function() {
    // Fetch the participant and event data from the server
    Populate.getCurrentEvent(Populate.adminId).then(function(eventData) {
      $rootScope.eventData = eventData;
      return Populate.getParticipants(eventData.data[0].id);
    }).then(function(participantData) {
      $rootScope.participantData = participantData.data[0].participants;
    }).catch(function(err) {
      console.log(err);
    });
  };

  $rootScope.getEvent();

  $rootScope.postParticipantStatus = function(participantId, eventId, participantStatus, refresh) {
    Populate.updateParticipantStatus(participantId, eventId, participantStatus)
    .then(function(refresh) {
      if (refresh) {
        $rootScope.getEvent();
      }
    });
  };

  // Fetch admin name for a given adminId
  Populate.getAdminName(Populate.adminId).then(function(adminInformation) {
    $rootScope.adminInformation = adminInformation;
  });

  // Fetch events data for given adminId
  Populate.getEventsByAdminId(Populate.adminId).then(function(eventsData) {
    $rootScope.eventsData = eventsData.data;
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
      $rootScope.$apply($rootScope.participantData.some(function(participant) {
        if (participant.id === message.participantId) {
          participant._pivot_status = message.checkinStatus;
          return true;
        }
      }));
    }
  });
});
