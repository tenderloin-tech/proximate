var express = require('express');
var morgan = require('morgan');
var config = require('./config/config.js');

// jscs: disable requireCamelCaseOrUpperCaseIdentifiers
var pubnub  = require('pubnub').init({
    publish_key:    config.publishKey,
    subscribe_key:  config.subscribeKey,
    channel:        'my_channel',
    user:           'Server'
});
// jscs: enable requireCamelCaseOrUpperCaseIdentifiers

pubnub.subscribe({
    channel: 'my_channel',
    callback: function(message) {
      console.log('Message received: ', message);
    },
    connect: publish
});

pubnub.publish({
    channel   : 'my_channel',
    callback  : function(e) { console.log('SUCCESS!', e); },
    error     : function(e) { console.log('FAILED! RETRY PUBLISH!', e); }
});

// test msg to see if server connect to pubnub channel
function publish() {
  pubnub.publish({
    channel   : 'my_channel',
    message   : 'Server subscribed YESSS!'
  });
}

var app = express();

var port = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(express.static(__dirname + '/../client'));

require('./routes/routes')(app);

app.listen(port);
