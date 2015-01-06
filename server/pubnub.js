var config = require('./config/config');
var helpers = require('./db/helpers.js');
var PubNub = require('pubnub').init(config.pubnub);

var pubnub = module.exports = {
  subscribe: function(channel, callback) {
    PubNub.subscribe({
      channel: channel,
      callback: callback
    });
  },

  publish: function(channel, message) {
    PubNub.publish({
      channel: channel,
      message: message,
      callback: function(res) {
        console.log('Published message to %s channel:', channel);
        console.dir(message);
      }
    });
  }
};

// Listen for and confirm received checkins
pubnub.subscribe('checkins', function(message) {
  if (message.eventType === 'didEnterRegion') {
    helpers.checkinUser(message.deviceId)
      .then(function(checkinProps) {
        if (checkinProps) {
          pubnub.publish('checkins', {
            eventType: 'checkinConfirm',
            deviceId: checkinProps.deviceId,
            eventId: checkinProps.eventId,
            participantId: checkinProps.participantId,
            checkinStatus: checkinProps.status
          });
        }
      })
      .catch(function(error) {
        console.log('Unable to checkin user', error);
      });
  }
});
