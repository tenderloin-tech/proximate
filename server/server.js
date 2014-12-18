var express = require('express');
var morgan = require('morgan');

var app = express();

var port = process.env.PORT || 8080;

app.use(morgan('dev'));
app.use(express.static(__dirname + '/../client'));

require('./routes/routes')(app);

app.listen(port);
