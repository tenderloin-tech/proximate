var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser');
var morgan = require('morgan');

var config = require('./config/config');

require('./db/db');
require('./pubnub');

// Cross domain detection supressed for emulator testing
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8100');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,OPTIONS,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

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
app.use(allowCrossDomain);

require('./routes')(app);

app.listen(port);
