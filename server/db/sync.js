var Promise = require('bluebird');
var models = require('../models');
var auth = require('../auth');
var helpers = require('./helpers');
var _ = require('underscore');
var moment = require('moment');

exports.sync = function() {

  var calendar = require('googleapis').calendar({version: 'v3', auth: auth});
  var adminParams = {
    id: 1,
    email: 'sgtonkin@gmail.com',
    lastSync: '2015-01-01T09:41:00.735-04:00'
  }

  var getCalendars = function() {

    var params = {
      minAccessRole: 'owner'
    }

    return new Promise(function (resolve, reject) {
      calendar.calendarList.list(params, function(err, data) {
        if(data) {
          resolve(_.pluck(data.items, 'id'));
        } else {
          reject(err);
        }
      });
    });

  }

  var getEvents = function(calendarId) {

    var params = {
      calendarId: calendarId,
      maxResults: 250,
      orderBy: 'starttime',
      sortorder: 'descending',
      showDeleted: true,
      singleEvents: true,
      updatedMin: adminParams.lastSync
    }

    return new Promise(function (resolve, reject) {
      calendar.events.list(params, function(err, data) {
        if(data) {
          resolve(data.items);
        } else {
          reject(err);
        }
      });
    });

  }

  var hasProximate = function(attendeeList) {
    return _.some(attendeeList, function(item) {
      return item.email === 'attendance@proximate.io';
    });
  }

  var isBeforeCutoff = function(event) {
    var cutoff = moment().add(3, 'months');
    var date = moment(event.start.dateTime);

    return date.isBefore(cutoff);
  }

  var isValid = function(event) {
    var conditions = [
      event.creator.email === adminParams.email,
      hasProximate(event.attendees),
      isBeforeCutoff(event),
      event.status === 'confirmed'
    ]

    return _.every(conditions,function(val) { return val; });
  }

  helpers.getAdminTokens('sgtonkin@gmail.com')
    .then(function(tokens) {
      auth.setCredentials(tokens);
    })
    .then(getCalendars)
    .then(function(calendarIds) {
      var events = _.map(calendarIds, function(item) {
        return getEvents(item);
      });
      return Promise.all(events)
    })
    .then(function(events) {
      var events = _.chain(events)
      .flatten()
      .filter(function(event) {
        return isValid(event);
      })
      .value()

      // For every event in the list
      // Run an upsert on that gcal ID in the events table
      //

    })
    .catch(function(error) {
      console.log('error', error);
    });

}
