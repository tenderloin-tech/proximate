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

  // Map gcal data to database fields and admin info before inserting
  var formatEvents = function(event) {
      return {
        gcal_id: event.id,
        name: event.summary,
        location: event.location,
        htmlLink: event.htmlLink,
        recurring_event_id: event.recurringEventId,
        start_time: event.start.dateTime,
        updated: event.updated,
        status: event.status,
        admin_id: adminParams.id
      }
  }

  // Filter attendees and reformat to match db field names
  var formatAttendees = function(attendees) {
    return _.chain(attendees)
      .filter(function(attendee) {
        if(attendee.self || attendee.email === 'attendance@proximate.io') {
          return false;
        }
        return true;
      })
      .map(function(attendee) {
        return {
          email: attendee.email,
          name: attendee.displayName || null
        }
      })
      .value();
  }

  // Pull out the event info
  var updateDb = function(events) {
    // Format participants for insertion
    var participants = _.map(events, function(event) {
      return formatAttendees(event.attendees);
    })


    // Format events for insertion and insert them
    _.each(events, function(event) {
      var formattedEvent = formatEvents(event);
      helpers.upsertEvent(formattedEvent);
    });

    // Clear duplicates from participants and insert them
    _.chain(participants)
      .flatten()
      .uniq(false, function(participant) {
        return participant.email;
      })
      .each(function(participant) {
        helpers.upsertParticipant(participant);
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
      return updateDb(events);
    })
    .catch(function(error) {
      console.log('Error syncing calendar', error);
    });

}


exports.sync();
