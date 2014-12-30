var express = require('express');
var bodyparser = require('body-parser');
var morgan = require('morgan');
var config = require('./config/config');
var db = require('./db/db');
var helpers = require('./db/helpers.js');
var pubnub = require('./pubnub');

// Listen for and confirm received checkins
pubnub.subscribe('checkins', function(message) {
  if (message.eventType === 'didEnterRegion') {
    helpers.checkinUser(message.deviceId, function(checkinProps) {
      pubnub.publish('checkins', {
        eventType: 'checkinConfirm',
        deviceId: checkinProps.deviceId,
        eventId: checkinProps.eventId,
        checkinStatus: checkinProps.status
      });
    });
  }
});

var app = express();

var port = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(express.static(__dirname + '/../client'));

require('./routes')(app);

app.listen(port);
