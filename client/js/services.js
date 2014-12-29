angular.module('proximate.services', [])

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
  });

  var subscribe = function(channel) {
    pubNub.subscribe({
      channel: channel,
      callback: function(message) {
        console.log('recieved message: ', message);
      }
    });
  };

  var publish = function(channel, message) {
    info = {
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
  var getAttendeeList = function() {
    return $http({
      method: 'GET',
      // not sure on correct endpoint
      url: 'api/event',
      data: attendees
    }).then(function(data) {
      console.log(data);
    }).catch(function(err) {
      console.log(err);
    });
  };
});
