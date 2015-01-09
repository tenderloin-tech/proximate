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
        return [{
          email: attendee.email,
          name: attendee.displayName || null
        },{
          gcal_response_status: attendee.responseStatus
        }]
      })
      .value();
  }

  // Format event_participant info an map to db fields

  var formatStatus = function(eventId, attendeeInfo) {
    // console.log('eventId', eventId);
    // console.log('attendeeInfo', attendeeInfo);
    // participantIds = _.chain(attendeeInfo)
    // .map(function(attendee) {
    //   return formatStatus(attendee.attributes, ;
    // })
    // .uniq()
    // .value();
  }

  // Pull out the event info
  var updateDb = function(events) {
    // Format events for insertion and insert them

    // Accept events that have attendees
      // These attendee records have a response status for a given event
      // We want to update the event in question and get an id for the event db record
      // Next we want to update any participant records in the db
      // Finally, once those participant records come back with an ID we want to combine them...
        // back again with their response status for this event and write

    _.each(events, function(event) {
      var formattedEvent = formatEvents(event);
      var formattedAttendees = formatAttendees(event.attendees);
      var eventId;
      var participantIds;
      var formattedStatus;

      helpers.upsertEvent(formattedEvent)
      .then(function(eventInfo) {
        eventId = eventInfo.attributes.id;

        // console.log('eventId', eventId);
        // console.log('formatted attendees', formattedAttendees)

        return promise.all(
          _.map(formattedAttendees, function(attendee) {
            console.log('attendee', attendee);
            return helpers.upsertParticipant(attendee[0]);
        }));
      })
      .then(function(attendeeInfo) {

        // console.log('attendee info after db', attendeeInfo, "\n");

        // Loop through each formatted attendee
        // Find a record in attendeee info where the emails match
        // Once you find that, add a new value to it that matches what we want to insert including eventId and participant id
        // insert it

        events_participants = _.map(formattedAttendees, function(formattedAttendee) {
          var matchedRecord = _.find(attendeeInfo, function(attendee) {
            // console.log('attendee', attendee, '\n');
            // console.log('formatted email', formattedAttendee[0].email);
            // console.log('attendee email', attendee.attributes.email);
            return formattedAttendee[0].email === attendee.attributes.email;
          });

          return {
            event_id: eventId,
            participantId: matchedRecord.attributes.id,
            gcal_response_status: formattedAttendee[1].gcal_response_status
          }

          // console.log('matchedRecord', matchedRecord);
          // console.log('formattedAttendee', formattedAttendee, '\n');


        })

        console.log('events participants', events_participants);



        // Combine the id field of this array with formattedAttendees based on a match on email

        // var formattedStatus = formatStatus(eventId, attendeeInfo);

        // For each participant ID, create or update an events_participants record


      });
    });

    // Clear duplicates from participants and insert them
    // _.chain(participants)
    //   .flatten()
    //   .uniq(false, function(participant) {
    //     return participant.email;
    //   })
    //   .each(function(participant) {
    //     helpers.upsertParticipant(participant);
    //   });



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
      // Take our filtered list of events and insert into db
      return updateDb(events);
    })
    .catch(function(error) {
      console.log('Error syncing calendar', error);
    });

}


exports.sync();


// Before insert

// formatted attendees [ [ { email: 'sgtonkin@gmail.com', name: 'Sebastian Tonkin' },
//     { gcal_response_status: 'needsAction' } ],
//   [ { email: 'avidunn@gmail.com', name: 'Avi Dunn' },
//     { gcal_response_status: 'needsAction' } ],
//   [ { email: 'poison5151@gmail.com', name: 'Valentyn Boginskey' },
//     { gcal_response_status: 'needsAction' } ],
//   [ { email: 'derek.barncard@gmail.com',
//       name: 'Derek Ryan Barncard' },
//     { gcal_response_status: 'accepted' } ] ]

// After db

// { attributes:
// { email: 'sgtonkin@gmail.com',
//        id: 68,
//        name: 'Sebastian Tonkin',
//        device_id: null },
//     _previousAttributes:
//      { email: 'sgtonkin@gmail.com',
//        id: 68,
//        name: 'Sebastian Tonkin',
//        device_id: null },
//     changed: {},
//     relations: {},
//     cid: 'c116',
//     _knex: null,
//     id: 68 },
//   { attributes:
//      { email: 'avidunn@gmail.com',
//        id: 39,
//        name: 'Avi Dunn',
//        device_id: null },
//     _previousAttributes:
//      { email: 'avidunn@gmail.com',
//        id: 39,
//        name: 'Avi Dunn',
//        device_id: null },
//     changed: {},
//     relations: {},
//     cid: 'c117',
//     _knex: null,
//     id: 39 },
