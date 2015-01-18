angular.module('proximate.controllers', [])

.controller('AppCtrl', function($q, $rootScope, $scope, $state, $window, Auth, Populate, PubNub) {

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
  $scope.currentEvent = {};
  $scope.currentEventParticipants = {};

  // Listen for checkin confirmations
  PubNub.subscribe('checkins', function(message) {
    console.log('message received', message);
    console.log('event participants', $scope.currentEventParticipants);
    if (message.eventType === 'checkinConfirm') {
      // Find the correct participant in participantData and update their status
      $scope.$apply($scope.currentEventParticipants.some(function(participant) {
        if (participant.id === message.participantId) {
          participant._pivot_status = message.checkinStatus;
          $scope.$broadcast('checkinConfirm', participant);
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

  // Gets participant and event data for a given eventId
  $scope.getParticipants = function(eventId) {
    if (eventId === 'current') {
      var deferred = $q.defer();

      deferred.resolve({
        event: $scope.currentEvent,
        participants: $scope.currentEventParticipants
      });

      return deferred.promise;
    }

    return Populate.getEventWithParticipants(eventId)
      .then(function(eventData) {
        return {
          event: eventData,
          participants: eventData.participants
        };
      });
  };

  // Sets event and participant scope variables for a given eventId
  $scope.setScopeVars = function(eventId) {
    $scope.getParticipants(eventId)
      .then(function(result) {
        $scope.event = result.event;
        $scope.participants = result.participants;
      })
      .catch(function(error) {
        console.log('Error retrieving event data');
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

.controller('AdminCtrl', function($scope) {

  // Sets CSS classes for editable participant statuses
  $scope.setClassForStatus = function(status) {
    if (status === null || status === 'null') {
      return 'absent';
    }
    return status;
  };
})

.controller('EventsCtrl', function($scope, $state, Populate) {

  $scope.displayFilterTime = 'all';
  $scope.displayFilterStatus = 'confirmed';

  // Calculate and set # of checked-in users for current event
  var setCheckinCount = function() {
    var eventParticipants = $scope.currentEventParticipants;
    var checkedInUserCount = 0;

    for (var i = 0; i < eventParticipants.length; i++) {
      var status = eventParticipants[i]._pivot_status;
      if (status !== null) {
        checkedInUserCount++;
      }
    }

    $scope.checkedInUserCount = checkedInUserCount;
    $scope.totalUserCount = eventParticipants.length;

  };

  $scope.setDisplayFilterTime = function(time) {
    $scope.displayFilterTime = time;
    $scope.displayFilterStatus = 'confirmed';
  };

  $scope.setDisplayFilterStatus = function(status) {
    $scope.displayFilterTime = 'all';
    $scope.displayFilterStatus = status;
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

  // Define checkin count on the scope so we can display
  setCheckinCount($scope.currentEventParticipants);
  $scope.$on('current-event-updated', setCheckinCount);

  // Apply selected logic to time selectors
  $('.tableControls .timeSelect li').on('click', function() {
    $(this).addClass('selected');
    $(this).siblings().removeClass('selected');
  });

})

.controller('ParticipantCtrl', function($scope, $stateParams, Participant, Populate) {

  // Init values for scope, setting params for status values
  $scope.participantInfo = {};
  $scope.eventHistory = {};
  $scope.stats = [
    {name: 'ontime', label:'On Time', id: 'history-stats-ontime', value: 0},
    {name: 'late', label:'Late', id: 'history-stats-late', value: 0},
    {name: 'excused', label:'Excused', id: 'history-stats-excused', value: 0},
    {name: null, label:'Absent', id: 'history-stats-absent', value: 0},
  ];

  $scope.updateParticipantStatus = function(participant) {
    Populate.updateParticipantStatus(participant.participant_id,
      participant.event_id, participant.status);
  };

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

    var widthScale = 100;
    var animationTime = 1000;
    var textAnimationTime = 500;

    $scope.stats.forEach(function(stat) {
      var nameForClass = stat.name === null ? 'absent' : stat.name;
      // If no vals calculated, hide element
      if (stat.value === 0) {
        $('#history-stats-' + nameForClass).css('display', 'none');
        return;
      }
      // Otherwise append and animate
      $('#history-stats-' + nameForClass)
        .css('opacity', 1)
        .animate({width: stat.value * widthScale + 'px'}, animationTime, 'swing',
          // Animate stats values on completion
          function() {
            $('#history-stats-' + nameForClass + ' strong')
            .animate({opacity: 1}, textAnimationTime);
          })
        .append('<span>' + nameForClass + ': <strong>' + stat.value + '</strong></span>');
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

  $scope.showAddBeacon = function() {
    $('.addBeacon').show();
    $('.addBeacon-toggle').hide();

  };

  $scope.hideAddBeacon = function() {
    $('.addBeacon').hide();
    $('.addBeacon-toggle').show();
  };

})

.controller('RosterCtrl', function($scope, $stateParams, Populate) {

  var eventId = $stateParams.eventId;

  $scope.setScopeVars(eventId);

  if (eventId === 'current') {
    $scope.$on('current-event-updated', function() {
      $scope.setScopeVars(eventId);
    });
  }

  $scope.updateParticipantStatus = function(participant) {
    Populate.updateParticipantStatus(participant.id,
      participant._pivot_event_id, participant._pivot_status);
  };

})

.controller('ProjectorCtrl', function($scope, $stateParams, $interval) {

  var eventId = $stateParams.eventId;

  $scope.setScopeVars(eventId);

  if (eventId === 'current') {
    $scope.$on('current-event-updated', function() {
      $scope.setScopeVars(eventId);
    });
  }

  $scope.$on('checkinConfirm', function(event, participant) {
    $scope.lastCheckin = participant;
    $scope.showToast();
  });

  /**** SETUP FOR TOASTS ****/

  $scope.showToast = function() {
    $('.toast').animate({
      opacity: [1, 'linear'],
      top: [0, 'swing']
    }, 450);

    setTimeout($scope.hideToast, 2000);
  };

  $scope.hideToast = function() {
    $('.toast').animate({
      opacity: [0, 'linear'],
      top: ['-100px', 'swing']
    }, 450);
  };

  var setCountdown = function(startTime) {
    var a = moment(startTime);
    var b = moment();
    $scope.countdown = moment.duration(a - b).format("mm:ss");
  };

  $scope.timeDiffFromEvent = null;
  $interval(function() {
    setCountdown($scope.currentEvent.start_time);
    var timeDiff = moment($scope.currentEvent.start_time).diff(moment(), 'seconds');
    if (timeDiff > 0 && timeDiff >= 3600) {
      // More than an hour in the future
      $scope.timeDiffFromEvent = null;
    } else if (timeDiff > 0 && timeDiff < 3600) {
      // Less than an hour in the future
      $scope.timeDiffFromEvent = true;

    } else {
      // In the past
      $scope.timeDiffFromEvent = false;
    }
  }, 1000);

});
