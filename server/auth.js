var auth = require('googleapis').auth;
var promise = require('bluebird');
var config = require('./config/config');
var helpers = require('./db/helpers');

// Promisify authentication API
promise.promisifyAll(auth);

// Initialize OAuth2 client
var client = exports.client = new auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  'postmessage'
);

// Authenticate existing user
exports.authenticate = function(email) {
  return helpers.getAdminTokens(email)
    .then(function(tokens) {
      if (tokens.expiry_date < Date.now()) {
        // Access token is expired
        client.setCredentials({refresh_token: tokens.refresh_token});
        return client.refreshAccessTokenAsync();
      } else {
        // Access token is valid
        return new promise(function(resolve, reject) {
          client.setCredentials({access_token: tokens.access_token});
          resolve();
        });
      }
    }).then(function(tokens) {
      if (tokens) {
        return helpers.updateAdminTokens(email, '', tokens);
      }
    });
};
