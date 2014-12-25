angular.module('proximate.services', [])

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
  });

  var subscribe = function(channel) {
    pubNub.subscribe({
      // not sure which channel to subscribe to, might want to change it
      channel: channel,
      callback: function(message) {
        console.log('recieved message: ', message);
      }
    });
  };

  return {
    subscribe: subscribe
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
