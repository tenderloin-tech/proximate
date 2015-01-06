var google = require('googleapis');
var config = require('./config/config');

// Initialize OAuth2 client
module.exports = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  'postmessage'
);
