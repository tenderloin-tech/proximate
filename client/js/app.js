angular.module('proximate',
  ['ui.router',
  'proximate.controllers',
  'proximate.services',
  'angularMoment',
  'ngAnimate'
  ])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('event', {
      templateUrl: 'views/event.html',
      controller: 'EventCtrl',
      url: '/'
    })

    .state('admin', {
      templateUrl: 'views/admin.html',
      controller: 'AdminCtrl',
      url: '/admin'
    });
})

.run(function($rootScope, PubNub, Populate) {
  $rootScope.participantData = [];
  // Fetch the participant and event data from the server
  Populate.getCurrentEvent().then(function(eventData) {
    $rootScope.eventData = eventData;
    return Populate.getParticipants(eventData.data.id);
  }).then(function(participantData) {
    $rootScope.participantData = participantData.data[0].participants;
  }).catch(function(err) {
    console.log(err);
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
