angular.module('proximate.services', [])

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
  });

  var subscribe = function(channel, callback) {
    pubNub.subscribe({
      channel: channel,
      callback: callback
    });
  };

  var publish = function(channel, message) {
    var info = {
      channel: channel,
      message: message
    };

    pubNub.publish(info);
  };

  return {
    subscribe: subscribe,
    publish: publish
  };

})

.factory('Populate', function($http) {
  // get event participants for a given eventID
  var getParticipants = function(eventID) {
    var url = 'api/events/' + eventID + '/participants';
    return $http({
      method: 'GET',
      url: url,
    });
  };

  // get current event ID
  var getCurrentEvent = function() {
    return $http({
      method: 'GET',
      url: 'api/events/current',
    });
  };

  return {
    getParticipants: getParticipants,
    getCurrentEvent: getCurrentEvent
  };

})

.filter('fromNow', function($rootScope) {
  return function(startTime, endTime) {
    $rootScope.timeDiffLessThanHourBefore = false;
    $rootScope.timeDiffMoreThanHourBefore = false;
    $rootScope.timeDiffAfter = false;
    a = moment(startTime);
    b = moment(endTime);
    if (Math.abs(a.diff(b, 'minutes')) <= 60 && a.diff(b, 'minutes') > 0) {
      $rootScope.timeDiffLessThanHourBefore = true;
    } else if (Math.abs(a.diff(b, 'minutes')) > 60 && a.diff(b, 'minutes') > 0) {
      $rootScope.timeDiffMoreThanHourBefore = true;
    } else {
      $rootScope.timeDiffAfter = true;
    }
    return moment.duration(a - b).humanize(true);
  };
})

.filter('removeArrivedParticipants', function($rootScope) {
  return function(participants) {
    var filteredResults = [];
    if (participants) {
      participants.forEach(function(participant) {
        for (var i = 0; i < $rootScope.arrivedParticipants.length; i++) {
          if (participant.id === $rootScope.arrivedParticipants[i].id) {
            return;
          }
        }
        filteredResults.push(participant);
      });
    }
    return filteredResults;
  };
});
