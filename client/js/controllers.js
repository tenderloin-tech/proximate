angular.module('proximate.controllers', [])

.controller('EventsCtrl', function($scope) {
  $scope.current = true;
})

.controller('HistoryCtrl', function($scope, $stateParams, $rootScope, History) {

  //get info about participant and populate view
  $scope.participantInfo = {};
  $scope.eventHistory = {};
  $scope.stats = [
    {name: 'ontime', label:'On Time', id: 'history-stats-ontime', value: 0},
    {name: 'late', label:'Late', id: 'history-stats-late', value: 0},
    {name: null, label:'Absent', id: 'history-stats-absent', value: 0},
  ];

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

    $scope.stats.forEach(function(stat) {
      var nameForClass = stat.name === null ? 'absent' : stat.name;
      if (stat.value === 0) {
        $('#history-stats-' + nameForClass).css('display', 'none');
      }
      $('#history-stats-' + nameForClass)
        .append('<span>' + nameForClass + ': <strong>' + stat.value + '</strong></span>')
        .animate({width: stat.value * 100 + 'px'}, 1000);
    });

  };

  History.getParticipantInfoFromId($stateParams.participantId).then(function(res) {
    $scope.participantInfo = res.data;
    console.log($scope.participantInfo);
  }).then(function() {

    return History.getHistoryByParticipantId($stateParams.participantId);

  }).then(function(res) {
    $scope.eventHistory = res.data.filter(function(item) {
      return (item.event.hasOwnProperty('name'));
      // add condition:
      // && moment(item.event.start_time).diff(moment()) < 0
    });
    computeStats();
    drawChart();
    console.log($scope.stats);
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

.controller('RosterCtrl', function($scope, $state) {

  $scope.showHistory = function(participantId) {
    $state.go('history', {participantId: participantId});
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

})

.controller('LoginCtrl', function($http, $scope, $state, googleKeys) {
  $scope.signinCallback = function(authResult) {
    if (authResult.code) {
      // Send the code to the server
      $http({
        method: 'POST',
        url: 'api/token',
        data: {
          code: authResult.code,
          state: stateToken
        },
      }).then(function(result) {
        // Render admin view
        $state.go('admin');
      }).catch(function(err) {
        console.log(err);
      });
    } else if (authResult.error) {
      console.log('User not authenticated: ', authResult.error);
    }
  };

  $scope.renderSignIn = function() {
    gapi.signin.render('signinButton', {
      'callback': $scope.signinCallback,
      'clientid': googleKeys.clientId,
      'scope': 'email profile https://www.googleapis.com/auth/calendar.readonly',
      'cookiepolicy': 'single_host_origin',
      'accesstype': 'offline'
    });
  };
  // Load the G+ API
  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://plus.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);

  po.onload = $scope.renderSignIn;
});
