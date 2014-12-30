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
  var getParticipants = function() {
    return $http({
      method: 'GET',
      url: 'api/events/:eventId/participants',
      data: attendees
    }).then(function(data) {
      console.log(data);
    }).catch(function(err) {
      console.log(err);
    });
  };

  var getCurrentEvent = function() {
    return $http({
      method: 'GET',
      url: 'api/events/current',
    }).then(function(data) {
      console.log(data);
    }).catch(function(err) {
      console.log(err);
    });
  };

  return {
    getParticipants: getParticipants,
    getCurrentEvent: getCurrentEvent
  };

});
