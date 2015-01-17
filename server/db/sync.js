var promise = require('bluebird');
var models = require('../models');
var auth = require('../auth');
var helpers = require('./helpers');
var _ = require('underscore');
var moment = require('moment');

module.exports = function(adminId) {

  // Define calendar API and admin info
  var calendar = require('googleapis').calendar({version: 'v3', auth: auth.client});

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
      showDeleted: true,
      singleEvents: true
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

  // Count status changes from return value of upsert event helper
  var countStatusChanges = function(eventRecords) {
    var statusRecords;

    if (eventRecords) {
      statusRecords = _.chain(eventRecords)
        .flatten()
        .filter(function(eventRecord) {
          return !!eventRecord;
        })
        .pluck('attributes')
        .value();
    }
    return (statusRecords) ? statusRecords.length : 0;
  };

  // Filter for events that have *@proximate in attendee list
  var proximateTestRegex = function(string) {
    if (string) {
      return /proximate\.io/i.test(string);
    }
    return false;
  };

  // Check for proximate in the attendee list
  var hasProximate = function(attendeeList) {
    return _.some(attendeeList, function(item) {
      return proximateTestRegex(item.email);
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
        !proximateTestRegex(attendee.email));
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
          !proximateTestRegex(attendee.email));
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

  var upsertEventsBeaconsParticipants = function(event) {
    // We want attendees in scope, but we need to remove them before event upsert
    var attendees = event.attendees;
    delete event.attendees;

    return helpers.upsertEvent(event)
      .then(function(model) {
        event = model;
        var adminId = event.get('admin_id');

        return new models.Beacons({admin_id: adminId}).fetch();
      })
      .then(function(beacons) {
        beacons.forEach(function(beacon) {
          var beaconEvent = {beacon_id: beacon.get('id'), event_id: event.id};

          new models.BeaconEvent(beaconEvent)
            .fetch()
            .then(function(model) {
              if (!model) {
                models.BeaconEvent.forge(beaconEvent).save();
              }
            });
        });
      })
      .then(function() {
        return helpers.upsertEventParticipants(event, attendees);
      });
  };

  // CONTROL FLOW FOR SYNC OPERATION

  // Closure scope var to store result of db/api calls
  var fetchedEvents;
  var participantIds;
  // Remainder of admin parameters will be fetched from DB
  var adminParams = {id: adminId};

  return helpers.getAdminName(adminId)
    .then(function(admin) {
      adminParams.email = admin.get('email');
    })
    .then(function() {
      return auth.authenticate(adminParams.email);
    })
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
      return promise.map(formattedAttendees, helpers.upsertParticipant);
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

      return promise.map(formattedEvents, upsertEventsBeaconsParticipants);
    })
    .then(function(eventRecords) {
      // Log the results of our update if successful
      console.log('created/updated', eventRecords.length, 'event records');
      var statusChangeCount = countStatusChanges(eventRecords);
      console.log('created/updated', statusChangeCount, 'status records');
    })
    .catch(function(error) {
      console.log('Error syncing calendar for', adminParams.email, error);
      throw new Error();
    });

};
