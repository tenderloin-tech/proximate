var express = require('express');
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

app.use(morgan('dev'));
app.use(bodyparser.json());

app.get('/', function(req, res) {
  res.redirect('splash.html');
});

app.use(express.static(__dirname + '/../client'));
app.use(allowCrossDomain);

require('./routes')(app);

app.listen(port);
