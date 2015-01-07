var promise = require('bluebird');
var models = require('../models');
var auth = require('../auth');
var helpers = require('./helpers');
var _ = require('underscore');

exports.sync = function() {

  var calendar = require('googleapis').calendar({version: 'v3', auth: auth});
  var calendarIds = [];

  var getCalendars = function() {
    var params = {
      minAccessRole: 'owner'
    }

    calendar.calendarList.list(params, function(err, data) {
      calendarIds = _.pluck(data.items, 'id');
      console.log(calendarIds);
    });
  }

  var query = {
        calendarId: 'sgtonkin@gmail.com',
        maxResults: 2500,
        orderBy: 'updated',
        showDeleted: true,
        singleEvents: true
      }


  helpers.getAdminTokens('sgtonkin@gmail.com')
    .then(function(tokens) {
      auth.setCredentials(tokens);
      getCalendars();
      // calendar.events.list(query, function(err, data) {
      //   console.log('data', data);
      //   console.log('err', err);
      // });
    })




}
