var promise = require('bluebird');
var models = require('../models');
var auth = require('../auth');
var helpers = require('./helpers');

exports.sync = function() {
  helpers.getAdminTokens('sgtonkin@gmail.com')
    .then(function(tokens) {
      console.log('tokens', tokens);
      auth.setCredentials(tokens);

      var calendar = require('googleapis').calendar({version: 'v3', auth: auth});

      var query = {
        calendarId: 'sgtonkin@gmail.com',
        maxResults: 2500,
        orderBy: 'updated',
        showDeleted: true,
        singleEvents: true
      }

      calendar.events.list(query, function(err, data) {
        console.log('data', data);
        console.log('err', err);
      });
    })




}
