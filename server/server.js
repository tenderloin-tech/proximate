var express = require('express');
var morgan = require('morgan');

var pubnub  = require("pubnub").init({
    publish_key:    "pub-c-e3770297-47d1-4fe9-9c34-cfee91f9fa9c",
    subscribe_key:  "sub-c-55cc2d3c-8617-11e4-a77a-02ee2ddab7fe",
    channel:        'my_channel',
    user:           'Server'
});

pubnub.subscribe({
    channel: 'my_channel',
    callback: function(message) {
      console.log("Message received: ", message);
    },
    connect: publish
});

pubnub.publish({
    channel   : 'my_channel',
    callback  : function(e) { console.log( "SUCCESS!", e ); },
    error     : function(e) { console.log( "FAILED! RETRY PUBLISH!", e ); }
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
