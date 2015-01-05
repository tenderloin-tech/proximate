var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser');
var morgan = require('morgan');

var config = require('./config/config');
var db = require('./db/db');
var helpers = require('./db/helpers.js');
var pubnub = require('./pubnub');

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

var app = express();

var port = process.env.PORT || 8080;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyparser.json());
app.use(session({
  secret: config.expressSession.secret,
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(__dirname + '/../client'));

require('./routes')(app);

app.listen(port);
