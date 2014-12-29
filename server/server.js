var express = require('express');
var bodyparser = require('body-parser');
var morgan = require('morgan');
var config = require('./config/config');
var db = require('./db/db');

var pubnub = require('pubnub').init(config.pubnub);

pubnub.subscribe({
    channel: config.pubnub.channel,
    callback: function(message) {
      console.log('Message received: ', message);
    }
});

// pubnub.publish({
//     channel   : config.channel,
//     callback  : function(e) { console.log('SUCCESS!', e); },
//     error     : function(e) { console.log('FAILED! RETRY PUBLISH!', e); }
// });

var app = express();

var port = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(express.static(__dirname + '/../client'));

require('./routes')(app);

app.listen(port);
