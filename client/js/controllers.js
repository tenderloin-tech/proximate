
angular.module('proximate.controllers', [])

.controller('EventsCtrl', function($scope, $state) {
  $scope.current = true;

  $scope.getEventRoster = function(event, eventId) {
    event.preventDefault();
    $state.go('roster', {eventId: eventId});
  };

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

.controller('RosterCtrl', function($scope, $state, $stateParams) {

  $scope.showParticipantHistory = function(participantId) {
    $state.go('participant', {participantId: participantId});
  };

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
