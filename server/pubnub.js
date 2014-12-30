var config = require('./config/config');
var pubnub = require('pubnub').init(config.pubnub);

module.exports = {
  subscribe: function(channel, callback) {
    pubnub.subscribe({
      channel: channel,
      callback: callback
    });
  },

  publish: function(channel, message) {
    pubnub.publish({
      channel: channel,
      message: message,
      callback: function(res) {
        console.log('Published message to %s channel:', channel);
        console.dir(message);
      }
    });
  }
};
