
angular.module('proximate.controllers', [])

.controller('AppCtrl', function($scope, $rootScope, $state, $window, Populate, PubNub, Auth) {

  // Load the G+ API
  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://plus.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);

  po.onload = function() {
    $scope.gapi_loaded = true;
    $scope.$broadcast('google-api-loaded');
  };

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

  /**** SETUP FOR RIGHT (ADMIN) MENU HANDLERS AND LISTENERS ****/

  // Fires on right menu clicks to handle opening and closing of right menu
  $scope.rightMenuClick = function(e) {
    if (!$('.subMenu').hasClass('show')) {
      openRightMenu();
    } else {
      closeRightMenu();
    }

  };

  // Detects clicks on the page outside the menu, and determines if the right menu is open
  // If it is, we close it.
  $('body').click(function(e) {
    if (!$(e.target).hasClass('admin-name') &&
        !$(e.target).hasClass('item') &&
        $('.admin-name').hasClass('menuOpen')) {
      closeRightMenu();
    }
  });

  // Utility function for opening right menu
  function openRightMenu() {
    $('.subMenu').addClass('show');
    $('.admin-name').addClass('menuOpen');
    $('.rightMenu .highlight').addClass('menuOpen');
  }

  // Utility function for closing right menu
  function closeRightMenu() {
    $('.subMenu').removeClass('show');
    $('.admin-name').removeClass('menuOpen');
    $('.rightMenu .highlight').removeClass('menuOpen');
  }

  $scope.signOut = Auth.signOut;

  // Fetch the participant and event data from the server
  $scope.getCurrentEventData = function() {
    Populate.getCurrentEvent($scope.adminId).then(function(eventData) {
      $scope.setCurrentEvent(eventData);
      return Populate.getEventWithParticipants($scope.currentEvent.id);
    }).then(function(eventData) {
      $scope.setCurrentEventParticipants(eventData.participants);
      $scope.$broadcast('current-event-updated');
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

  // Set the username and fetch current event data
  $scope.getAdminAndEventInfo = function() {
    $scope.username = $window.sessionStorage.name;

    Populate.getAdminId($window.sessionStorage.email)
      .then(function(adminId) {
        $scope.adminId = adminId;
        $scope.getCurrentEventData();
      });
  };

  // Get admin and event info on user login
  $rootScope.$on('auth-login-success', function() {
    $scope.getAdminAndEventInfo();
    if ($rootScope.next) {
      $state.go($rootScope.next);
    } else {
      $state.go('admin.events');
    }
  });

  // Fetch relevant info again in case the controller is reloaded
  if (Auth.isAuth()) { $scope.getAdminAndEventInfo(); }
})

.controller('EventsCtrl', function($scope, $state, Populate) {

  $scope.displayFilter = 'past';

  $scope.setDisplayFilter = function(time) {
    $scope.displayFilter = time;
  };

  // Click handler for getting roster for a single event
  $scope.getEventRoster = function(event, eventId) {
    event.preventDefault();
    $state.go('admin.roster', {eventId: eventId});
  };

  // Fetch events data for given adminId
  Populate.getEventsByAdminId($scope.adminId).then(function(eventsData) {
    $scope.events = eventsData;
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
    Populate.getBeaconsByAdminId($scope.adminId).then(function(beaconData) {
      $scope.beaconsData = beaconData;
    });
  };
  $scope.getBeacons();
  // post beacon data
  $scope.addBeacon = function(beacon) {
    Populate.postNewBeacon($scope.adminId, beacon)
    .then(function() {
      $scope.beaconsData.push(beacon);
    });
  };

})

.controller('RosterCtrl', function($scope, $rootScope, $state, $stateParams, Populate) {

  var eventId = $stateParams.eventId;

  // This function pulls current event info from the AppCtrl scope
  $scope.setScopeVars = function() {
    $scope.event = $scope.currentEvent;
    $scope.participants = $scope.currentEventParticipants;
  };

  $scope.getParticipants = function() {
    // If the specified event is 'current', populate with the latest event
    if (eventId === 'current') {
      $scope.setScopeVars();
      $scope.$on('current-event-updated', function() {
        $scope.setScopeVars();
      });
    // Or proceed to get event by id
    } else {
      Populate.getEventWithParticipants(eventId).then(function(eventData) {
        $scope.event = eventData;
        $scope.participants = eventData.participants;
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

.controller('ProjectorCtrl', function($scope, $interval) {

  $scope.timeDiffFromEvent = null;
  $interval(function() {
    var timeDiff = moment($scope.currentEvent.start_time).diff(moment(), 'seconds');
    if (timeDiff > 0 && timeDiff >= 3600) {
      $scope.timeDiffFromEvent = null;
    } else if (timeDiff > 0 && timeDiff < 3600) {
      $scope.timeDiffFromEvent = true;
    } else {
      $scope.timeDiffFromEvent = false;
    }

  });
});
