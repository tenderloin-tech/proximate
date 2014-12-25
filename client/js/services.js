angular.module('proximate.services', [])

.factory('PubNub', function(pubNubKeys) {
  var pubNub = PUBNUB.init({
    publish_key: pubNubKeys.pub,
    subscribe_key: pubNubKeys.sub
  });

  pubNub.subscribe({
    // not sure which channel to subscribe to, might want to change it
    channel: my_channel,
    callback: function(message) {
      console.log('recieved message: ', message);
    }
  });

});
