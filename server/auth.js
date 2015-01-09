var auth = require('googleapis').auth;
var promise = require('bluebird');

//                                              __----~~~~~~~~~~~------___
//                                   .  .   ~~//====......          __--~ ~~
//                   -.            \_|//     |||\\  ~~~~~~::::... /~
//                ___-==_       _-~o~  \/    |||  \\            _/~~-
//        __---~~~.==~||\=_    -_--~/_-~|-   |\\   \\        _/~
//    _-~~     .=~    |  \\-_    '-~7  /-   /  ||    \      /
//  .~       .~       |   \\ -_    /  /-   /   ||      \   /
// /  ____  /         |     \\ ~-_/  /|- _/   .||       \ /
// |~~    ~~|--~~~~--_ \     ~==-/   | \~--===~~        .\
//          '         ~-|      /|    |-~\~~       __--~~
//                      |-~~-_/ |    |   ~\_   _-~            /\
//                           /  \     \__   \/~                \__
//                       _--~ _/ | .-~~____--~-/                  ~~==.
//                      ((->/~   '.|||' -_|    ~~-/ ,              . _||
//                                 -_     ~\      ~~---l__i__i__i--~~_/
//                                 _-~-__   ~)  \--______________--~~
//                               //.-~~~-~_--~- |-------~~~~~~~~
//                                      //.-~~~--\

var jws = require('jws');
var module = require('module');
// This overrides the cached jws module with our shimmed version
// The jsonwebtoken module will now use the shim when it executes require('jws')
module._cache[require.resolve('jws')]['exports'] = require('jws-jwk').shim();
var jwt = require('jsonwebtoken');
// End dragons
var request = require('request');

var config = require('./config/config');
var helpers = require('./db/helpers');

// Promisify stuff
promise.promisifyAll(auth);
promise.promisifyAll(request);
promise.promisifyAll(jwt);

// Initialize OAuth2 client
var client = exports.client = new auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  'postmessage'
);

// Set up storage of google JWK set
var jwkSet = {};

// Fetch new public key set from google
var refreshJWKS = function() {
  // This URL will not change
  var discoveryDocUrl = 'https://accounts.google.com/.well-known/openid-configuration';

  return request.getAsync({url: discoveryDocUrl, json: true})
    .spread(function(response, body) {
      // Get google public key endpoint
      return body.jwks_uri;
    }).then(function(certUrl) {
      // Retrieve public keys
      return request.getAsync({url: certUrl, json: true});
    }).spread(function(response, body) {
      // Save set of keys in variable
      jwkSet = body;
      return jwkSet;
    }).catch(function(err) {
      console.log('Error refreshing Google public keys');
    });
};

// Authenticate existing user for server-side use
// TODO: Refactor using Promise.method
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
// Authenticate request from client
exports.authClient = function(req, res, next) {
  var token;
  // Verify client token is present
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length == 2) {
      var scheme = parts[0];
      var credentials = parts[1];

      if (/^Bearer$/i.test(scheme)) {
        token = credentials;
      }
    } else {
      return res.status(401).send('Invalid authorization format');
    }
  }

  if (!token) {
    return res.status(401).send('No authorization token found');
  }

  // TODO: only refresh public keys if necessary
  refreshJWKS().then(function(keys) {
    // Verify token signature
    return jwt.verifyAsync(token, keys, {aud: config.google.clientId, iss: 'accounts.google.com'});
  }).then(function(payload) {
    payload = JSON.parse(payload);
    // At this point, token is signed by Google
    console.log('Authenticated', payload.email);
    next();
  }).catch(function(err) {
    if (err.name = 'TokenExpiredError') {
      return res.status(401).send('Token expired');
    } else {
      return res.status(401).send('Authentication error');
    }
  });
};
