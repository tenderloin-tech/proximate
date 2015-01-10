
angular.module('proximate.controllers', [])

.controller('EventsCtrl', function($scope, $rootScope, $state, Populate) {
  $scope.current = true;

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

.controller('ParticipantCtrl', function($scope, $stateParams, $rootScope, Participant) {

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
    // If the specified event is 'current', populate with the latest event, applying to rootScope
    // as well for sharing with the projector view
    if (eventId === 'current') {
      Populate.getCurrentEvent(Populate.adminId).then(function(eventData) {
        $scope.event = $rootScope.data.currentEvent = eventData.data;
        return Populate.getParticipants(eventData.data.id);
      }).then(function(participantData) {
        $rootScope.data.currentEventParticipants = participantData.data[0].participants;
        $scope.participants = $rootScope.data.currentEventParticipants;
      }).catch(function(err) {
        console.log(err);
      });
      // Or proceed to get event by id
    } else {
      Populate.getParticipants(eventId).then(function(participantData) {
        $scope.event = participantData.data[0];
        $scope.participants = participantData.data[0].participants;
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
