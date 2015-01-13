
angular.module('proximate.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $window, Populate, PubNub) {

  // Initialize scope variables
  $scope.arrivedParticipants = [];
  $scope.currentEvent = {};
  $scope.currentEventParticipants = {};

  // Listen for checkin confirmations and add these to arrivedParticipants
  PubNub.subscribe('checkins', function(message) {
    if (message.eventType === 'checkinConfirm') {
      $scope.arrivedParticipants.push({
        id: message.participantId,
        status: message.checkinStatus
      });
      // Find the correct participant in participantData and update their status
      $scope.$apply($scope.currentEventParticipants.some(function(participant) {
        if (participant.id === message.participantId) {
          participant._pivot_status = message.checkinStatus;
          return true;
        }
      }));
    }
  });

  // Fetch the participant and event data from the server
  $scope.getCurrentEventData = function() {
    Populate.getCurrentEvent(Populate.adminId).then(function(eventData) {
      $scope.setCurrentEvent(eventData.data);
      return Populate.getEventWithParticipants($scope.currentEvent.id);
    }).then(function(eventData) {
      $scope.setCurrentEventParticipants(eventData.data.participants);
    }).catch(function(err) {
      console.log(err);
    });
  };

  // Setter for currentEvent
  $scope.setCurrentEvent = function(currentEvent) {
    $scope.currentEvent = currentEvent;
  };

  // Setter for currentEventParticipants
  $scope.setCurrentEventParticipants = function(currentEventParticipants) {
    $scope.currentEventParticipants = currentEventParticipants;
  };

  // Set the username and fetch current event data on user login
  $rootScope.$on('auth-login-success', function() {
    $scope.username = $window.sessionStorage.name;
    $scope.getCurrentEventData();
  });

})

.controller('EventsCtrl', function($scope, $state, Populate) {
  // $scope.current = true;

  // Click handler for getting roster for a single event
  $scope.getEventRoster = function(event, eventId) {
    event.preventDefault();
    $state.go('admin.roster', {eventId: eventId});
  };

  // Fetch events data for given adminId
  Populate.getEventsByAdminId(Populate.adminId).then(function(eventsData) {
    $scope.events = eventsData.data;
  });

})

.controller('ParticipantCtrl', function($scope, $stateParams, Participant) {

  // Init values for scope, setting params for status values
  $scope.participantInfo = {};
  $scope.eventHistory = {};
  $scope.stats = [
    {name: 'ontime', label:'On Time', id: 'history-stats-ontime', value: 0},
    {name: 'late', label:'Late', id: 'history-stats-late', value: 0},
    {name: null, label:'Absent', id: 'history-stats-absent', value: 0},
  ];

  // Populates $scope.stats for use in table and chart
  var computeStats = function() {

    $scope.eventHistory.forEach(function(event) {
      $scope.stats.forEach(function(item) {
        if (item.name === event.status) {
          item.value++;
        }
      });
    });

  };

  var drawChart = function() {

    // var maxWidth = $('table').css('width');
    var widthScale = 100;
    var animationTime = 1000;

    $scope.stats.forEach(function(stat) {
      var nameForClass = stat.name === null ? 'absent' : stat.name;
      // If no vals calculated, hide element
      if (stat.value === 0) {
        $('#history-stats-' + nameForClass).css('display', 'none');
      }
      // Otherwise append and animate
      $('#history-stats-' + nameForClass)
        .append('<span>' + nameForClass + ': <strong>' + stat.value + '</strong></span>')
        .animate({width: stat.value * widthScale + 'px'}, animationTime);
    });

  };

  Participant.getParticipantInfoFromId($stateParams.participantId).then(function(res) {
    $scope.participantInfo = res.data;
  }).then(function() {
    return Participant.getHistoryByParticipantId($stateParams.participantId);
  }).then(function(res) {
    $scope.eventHistory = res.data.filter(function(item) {
      return (item.event.hasOwnProperty('name') &&
        moment(item.event.start_time).diff(moment()) < 0);
    });
    //Then call functions with fetched info
    computeStats();
    drawChart();
  });

})

.controller('BeaconsCtrl', function($scope, Populate) {

  $scope.beaconsData = [];
  // get beacons for given adminID
  $scope.getBeacons = function() {
    Populate.getBeaconsByAdminId(Populate.adminId).then(function(beaconData) {
      $scope.beaconsData = beaconData.data;
    });
  };
  $scope.getBeacons();
  // post beacon data
  $scope.beaconData = {};
  $scope.postBeacons = function(user) {
    Populate.postNewBeacon(Populate.adminId, user.identifier, user.uuid, user.major, user.minor)
      .then($scope.getBeacons());
  };
})

.controller('RosterCtrl', function($scope, $rootScope, $state, $stateParams, Populate) {

  var eventId = $stateParams.eventId;

  $scope.getParticipants = function() {
    // If the specified event is 'current', populate with the latest event
    if (eventId === 'current') {
      $scope.getCurrentEventData();
      $scope.event = $scope.currentEvent;
      $scope.participants = $scope.currentEventParticipants;
      // Or proceed to get event by id
    } else {
      Populate.getEventWithParticipants(eventId).then(function(eventData) {
        $scope.event = eventData.data;
        $scope.participants = eventData.data.participants;
      }).catch(function(error) {
        console.log(error);
      });
    }
  };

  // Click handler for getting event participation history
  $scope.showParticipantHistory = function(participantId) {
    $state.go('admin.participant', {participantId: participantId});
  };

  $scope.updateParticipantStatus = Populate.updateParticipantStatus;

  $scope.getParticipants();

})

.controller('ProjectorCtrl', function($scope) {

  var updateClock = function() {
    $scope.clock = new Date();
  };

  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();

});
