var promise = require('bluebird');
var models = require('../models');
var auth = require('../auth');
var helpers = require('./helpers');
var _ = require('underscore');
var moment = require('moment');
var mapSeries = require('promise-map-series')

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

  // HELPERS TO FORMAT AND FILTER FETCHED EVENTS

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

  var filterAttendees = function(attendees, participantIds) {
    return _.chain(attendees)
    .filter(function(attendee) {
      return (attendee !== undefined && !attendee.self && attendee.email !== 'attendance@proximate.io');
    })
    .map(function(attendee) {
      var matchingRecord = _.find(participantIds, function(participant) {
        return participant.email === attendee.email;
      });
      return {
        participant_id: matchingRecord.participant_id,
        email: attendee.email,
        name: attendee.displayName || null,
        gcal_response_status: attendee.responseStatus
      }
    })
    .value();
  }

  // Map gcal data to database fields and admin info before inserting
  var formatEvents = function(events, participantIds) {

    return _.chain(events)
    .uniq(function(event) {
      return event.id
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
      }
    })
    .value();

  }

  // OLD ATTENDEE FILTER FUNCTION
  // var formatAttendees = function(attendees) {
  //   return _.chain(attendees)
  //     .filter(function(attendee) {
  //       if(attendee.self || attendee.email === 'attendance@proximate.io') {
  //         return false;
  //       }
  //       return true;
  //     })
  //     .map(function(attendee) {
  //       return [{
  //         email: attendee.email,
  //         name: attendee.displayName || null
  //       },{
  //         gcal_response_status: attendee.responseStatus
  //       }]
  //     })
  //     .value();
  // }

  // FUNCTIONS TO FILTER PARTICIPANT INFORMATION

  var formatAttendees = function(events) {

    var attendees = _.pluck(events, 'attendees');

    attendees = _.chain(attendees)
    .flatten()
    .filter(function(attendee) {
      return (attendee !== undefined && !attendee.self && attendee.email !== 'attendance@proximate.io');
    })
    .uniq(function(attendee) {
      return attendee.email;
    })
    .map(function(attendee) {
      return {
        email: attendee.email,
        name: attendee.displayName || null
      }
    })
    .value()

    return attendees;

  }


  var formatEventParticipants = function(eventRecords, participantIds, fetchedEvents) {
    // console.log('event record', eventRecords[0]);
    // console.log('participant id', participantIds[0]);
    // console.log('fetched events', fetchedEvents[0]);
      // We have the eventRecords which has gcal_id and event_id
      // We have participant_ids which has email and participant_id
      // We have fetched events which maps attendees to events via gcal id

    // We want {eventRecords.attributes.id, participantIds.id, fetchedEvents.attendees[0...n]}

    // Extract the event ID and gcal ID from the db records
    // var eventsParticipants = _.map(eventRecords, function(eventRecord) {
    //   return {
    //     event_id: eventRecord.attributes.id,
    //     gcal_id: eventRecord.attributes.gcal_id,
    //   }
    // });

    // console.log(eventsParticipants);

    // // Add fetchedEvents.attendees if gcal id matches
    // eventsParticipants = _.map(eventsParticipants, function(eventParticipant) {
    //   fetchedEvent = _.find(fetchedEvents, function(fetchedEvent) {
    //     return fetchedEvent.id === eventParticipant.gcal_id;
    //   });
    //   eventParticipant.attendees = filterAttendees(fetchedEvent.attendees,);
    //   return eventParticipant;
    // })

    //console.log('events_participants', eventsParticipants);
    // EventsParticipants
      // Return {eventRecords.attributes.id: {attendees: fetchedEvents.attendees}} on fetchedEvents.id = eventRecords.gcal_id


  }

  // CONTROL FLOW FOR SYNC OPERATIONS

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
      return promise.all(events)
    })
    .then(function(events) {
      // Flatten and apply the filters defined above
      fetchedEvents =
        _.chain(events)
        .flatten()
        .filter(function(event) {
          return isValid(event);
        })
        .value()

      // Update the participants table with a formatted group of participants
      var formattedAttendees = formatAttendees(fetchedEvents);
      return promise.all(_.map(formattedAttendees, helpers.upsertParticipant));
    })
    .then(function(participantRecords) {
      // Store participant ids to access later once db operation is complete
      participantIds = _.map(participantRecords, function(participant) {
        return {
          participant_id: participant.attributes.id,
          email: participant.attributes.email }
      });

      // Now update all the event records

      var formattedEvents = formatEvents(fetchedEvents, participantIds);
      //console.log('single event for insertion', formattedEvents[8]);
      //console.log('single event attendees insertion', formattedEvents[8].attendees, '\n');
      return promise.all(_.map(formattedEvents, helpers.upsertEvent));
    })
    .then(function(eventRecords) {
      //console.log('one event record after insert', eventRecords[0]);
    //   //Finally update the event status

    //   var formattedEventParticipants = formatEventParticipants(eventRecords, participantIds, fetchedEvents);

    //   //_.each(eventRecords, function(record) { console.log('record', record) });
    })
    // .catch(function(error) {
    //   console.log('Error syncing calendar', error);
    // });

}


exports.sync();


