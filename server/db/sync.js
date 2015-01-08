var promise = require('bluebird');
var models = require('../models');
var auth = require('../auth');
var helpers = require('./helpers');
var _ = require('underscore');
var moment = require('moment');

exports.sync = function() {

  // Define calendar API and admin info
  var calendar = require('googleapis').calendar({version: 'v3', auth: auth.client});
  var adminParams = {
    id: 1,
    email: 'sgtonkin@gmail.com',
    lastSync: '2015-01-01T09:41:00.735-04:00'
  }

  // Get the calendar IDs for all gcal this admin email owns
  var getCalendars = function() {
    var params = {
      minAccessRole: 'owner'
    }

    return new promise(function (resolve, reject) {
      calendar.calendarList.list(params, function(err, data) {
        if(data) {
          resolve(_.pluck(data.items, 'id'));
        } else {
          reject(err);
        }
      });
    });
  }

  // Fetch all the events for the calendarIDs belonging to this admin
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

    return new promise(function (resolve, reject) {
      calendar.events.list(params, function(err, data) {
        if(data) {
          resolve(data.items);
        } else {
          reject(err);
        }
      });
    });

  }

  // Check for proximate in the attendee list
  var hasProximate = function(attendeeList) {
    return _.some(attendeeList, function(item) {
      return item.email === 'attendance@proximate.io';
    });
  }

  // Only get events that occur up to three months in the future
  var isBeforeCutoff = function(event) {
    var cutoff = moment().add(3, 'months');
    var date = moment(event.start.dateTime);

    return date.isBefore(cutoff);
  }

  // Helper to filter events returned by Gcal
  var isValid = function(event) {
    var conditions = [
      event.creator.email === adminParams.email,
      hasProximate(event.attendees),
      isBeforeCutoff(event)
    ]

    return _.every(conditions,function(val) { return val; });
  }

  var formatEventsForDb = function(events) {
    return _.map(events, function(item) {
      return {
        gcal_id: item.id,
        name: item.summary,
        location: item.location,
        htmlLink: item.htmlLink,
        recurring_event_id: item.recurringEventId,
        start_time: item.start.dateTime,
        updated: item.updated,
        status: item.status,
        admin_id: adminParams.id
      }
    });
  }

  // Pull out the event into and upsert it
  var syncEvents = function(events) {
    _.each(formatEventsForDb(events), function(event) {
      helpers.upsertEvent(event);
    });

    _.each(events.attendees, function(participant) {
      console.log('participant', participant);
    });
  }

  auth.authenticate(adminParams.email)
    .then(getCalendars)
    .then(function(calendarIds) {
      // Get the gcal event data from all calendars into one array
      var events = _.map(calendarIds, function(item) {
        return getEvents(item);
      });
      // Make sure all gcal calls are finished before continuing
      return promise.all(events)
    })
    .then(function(events) {
      // Flatten and apply the filters defined above
      var events =
        _.chain(events)
        .flatten()
        .filter(function(event) {
          return isValid(event);
        })
        .value()
      // Update the events in the db
      syncEvents(events);
    })
    .catch(function(error) {
      console.log('Error syncing calendar', error);
    });

}


exports.sync();
