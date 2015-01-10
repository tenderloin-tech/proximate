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
  };

  // Get the calendar IDs for all gcal calendars this admin email owns
  var getCalendars = function() {

    var params = {
      minAccessRole: 'owner'
    };

    return new promise(function(resolve, reject) {
      calendar.calendarList.list(params, function(err, data) {
        if (data) {
          resolve(_.pluck(data.items, 'id'));
        } else {
          reject(err);
        }
      });
    });

  };

  // Fetch all the events for the gcal_id's belonging to this admin
  var getEvents = function(calendarId) {

    var params = {
      calendarId: calendarId,
      maxResults: 250,
      orderBy: 'starttime',
      sortorder: 'descending',
      showDeleted: true,
      singleEvents: true,
      updatedMin: adminParams.lastSync
    };

    return new promise(function(resolve, reject) {
      calendar.events.list(params, function(err, data) {
        if (data) {
          resolve(data.items);
        } else {
          reject(err);
        }
      });
    });

  };

  // HELPERS TO FORMAT AND FILTER FETCHED EVENTS

  // Check for proximate in the attendee list
  var hasProximate = function(attendeeList) {
    return _.some(attendeeList, function(item) {
      return item.email === 'attendance@proximate.io';
    });
  };

  // Only get events that occur up to three months in the future
  var isBeforeCutoff = function(event) {
    var cutoff = moment().add(3, 'months');
    var date = moment(event.start.dateTime);
    return date.isBefore(cutoff);
  };

  // Make sure the event meet all conditions before performing operations
  var isValid = function(event) {
    var conditions = [
      event.creator.email === adminParams.email,
      hasProximate(event.attendees),
      isBeforeCutoff(event)
    ];
    return _.every(conditions, function(val) { return val; });
  };

  // Prepare attendees array of events object for db insert into events_participants table
  var filterAttendees = function(attendees, participantIds) {
    return _.chain(attendees)
    .filter(function(attendee) {
      return (attendee !== undefined &&
        !attendee.self &&
        attendee.email !== 'attendance@proximate.io');
    })
    // Join any attendee records for the event with the participantIds returns from the db
    .map(function(attendee) {
      var matchingRecord = _.find(participantIds, function(participant) {
        return participant.email === attendee.email;
      });
      return {
        participant_id: matchingRecord.participant_id,
        email: attendee.email,
        name: attendee.displayName || null,
        gcal_response_status: attendee.responseStatus
      };
    })
    .value();
  };

  // Isolate gcal event fields we need and combine with adminid, participantids
  var formatEvents = function(events, participantIds) {
    return _.chain(events)
      .uniq(function(event) {
        return event.id;
      })
      .map(function(event) {
        return {
          gcal_id: event.id,
          name: event.summary,
          location: event.location,
          htmlLink: event.htmlLink,
          recurring_event_id: event.recurringEventId,
          start_time: event.start.dateTime,
          updated: event.updated,
          status: event.status,
          admin_id: adminParams.id,
          attendees: filterAttendees(event.attendees, participantIds)
        };
      })
      .value();
  };

  // FUNCTIONS TO FILTER PARTICIPANT INFORMATION

  // Extract a unique array of attendees to update participants table
  var formatAttendees = function(events) {
    var attendees = _.pluck(events, 'attendees');

    return _.chain(attendees)
      .flatten()
      .filter(function(attendee) {
        return (attendee !== undefined &&
          !attendee.self &&
          attendee.email !== 'attendance@proximate.io');
      })
      .uniq(function(attendee) {
        return attendee.email;
      })
      .map(function(attendee) {
        return {
          email: attendee.email,
          name: attendee.displayName || null
        };
      })
      .value();
  };

  // CONTROL FLOW FOR SYNC OPERATION

  // Closure scope var to store result of db/api calls
  var fetchedEvents;
  var participantIds;

  auth.authenticate(adminParams.email)
    .then(getCalendars)
    .then(function(calendarIds) {
      // Get the gcal event data from all calendars into one array
      var events = _.map(calendarIds, function(item) {
        return getEvents(item);
      });
      // Make sure all gcal calls are finished before continuing
      return promise.all(events);
    })
    .then(function(events) {
      // Flatten resulting event data and call the helpers defined above
      fetchedEvents =
        _.chain(events)
        .flatten()
        .filter(function(event) {
          return isValid(event);
        })
        .value();

      // Update the participants table with a formatted group of participants
      var formattedAttendees = formatAttendees(fetchedEvents);
      return promise.all(_.map(formattedAttendees, helpers.upsertParticipant));
    })
    .then(function(participantRecords) {
      console.log('created/updated', participantRecords.length, 'participant records');
      // Store participant ids to access later once db operation is complete
      participantIds = _.map(participantRecords, function(participant) {
        return {
          participant_id: participant.attributes.id,
          email: participant.attributes.email
        };
      });

      // Update the events and events_participants tables
      var formattedEvents = formatEvents(fetchedEvents, participantIds);
      return promise.all(_.map(formattedEvents, helpers.upsertEvent));
    })
    .then(function(eventRecords) {
      console.log('created/updated', eventRecords.length, 'event records');

      var statusRecordCount = 0;
      _.each(eventRecords, function(eventRecord) {
        if (eventRecord) {
          statusRecordCount += eventRecord.length;
        }
      });
      console.log('created/updated', statusRecordCount, 'status records');
    })
    .catch(function(error) {
      console.log('Error syncing calendar for', adminParams.email, error);
    });

};

exports.sync();
