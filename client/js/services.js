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
  var getParticipants = function(eventID, callback) {
    var url = 'api/events/' + eventID + '/participants';
    return $http({
      method: 'GET',
      url: url,
    }).then(function(data) {
      console.log('data in getParticipants', data);
      callback(data);
    }).catch(function(err) {
      console.log(err);
    });
  };

  // get current event ID
  var getCurrentEvent = function(callback) {
    return $http({
      method: 'GET',
      url: 'api/events/current',
    }).then(function(data) {
      console.log('data in getCurrentEvent', data);
      callback(data);
    }).catch(function(err) {
      console.log(err);
    });
  };

  return {
    getParticipants: getParticipants,
    getCurrentEvent: getCurrentEvent
  };

});
