var promise = require('bluebird');
var models = require('../models');
var helpers = require('./helpers');

exports.seedTables = function() {

  models.Admin.forge({name: 'Pira'}).save();

  var participants = models.Participants.forge([
    {name: 'John Tan', device_id: '999'},
    {name: 'David Raleigh'},
    {name: 'Sunny Gonnabathula'},
    {name: 'Michael Lom'},
    {name: 'Rene Polo'},
    {name: 'Sebastian Tonkin'},
    {name: 'Rustin Crandall'},
    {name: 'Brett Leibowitz'},
    {name: 'Alex Dajani'},
    {name: 'Arthur Chan'},
    {name: 'Robert Niimi'},
    {name: 'Bernard Chu'},
    {name: 'Nikhil Ballaney'},
    {name: 'Judy Zaratan'},
    {name: 'Brian Zindler'},
    {name: 'Tim Hua'},
    {name: 'Rick Takes'},
    {name: 'Rachel Sison'},
    {name: 'Anastasia Zotova'},
    {name: 'Owen Diehl'},
    {name: 'Valentyn Boginskey'},
    {name: 'Avi Dunn'},
    {name: 'Raymond Ma'},
    {name: 'Issac Pao'},
    {name: 'Derek Wu'},
    {name: 'Douglas Eichelberger'},
    {name: 'Derek Barncard'},
    {name: 'Christopher Trevino'},
    {name: 'Dennis Lin'},
    {name: 'Liz Portnoy'},
    {name: 'Cory Asato'}
  ]);

  promise.all(participants.invoke('save')).then(function() {
  });

  // EVENTS

  var events = models.Events.forge([
    {
      name: 'Kickoff',
      start_time: '2014-12-28 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-12-29 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-12-30 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-02 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-03 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-05 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-06 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-07 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-08 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2015-01-09 09:00:00',
      admin_id: 1
    }
  ]);

  promise.all(events.invoke('save')).then(function() {
  });

  // EVENT PARTICIPANTS

  var generateEventsParticipants = function() {
    var eventsParticipants = [];
    var status = 'ontime';
    for (var i = 1; i < 25; i++) {
      for (var j = 1; j < 10; j++) {
        eventsParticipants.push(
          {
            participant_id: i,
            event_id: j,
            status: status
          }
        );
        status = (status === 'ontime') ? 'late' : 'ontime';
      }
    }
    return eventsParticipants;
  };

  var eventsParticipants = models.EventsParticipants.forge(generateEventsParticipants());

  promise.all(eventsParticipants.invoke('save')).then(function() {

    // // Get event participants for a given event
    //  helpers.getEventParticipants('1')
    //   .then(function(model) {
    //     console.log(model.toJSON());
    //   })
    //   .catch(function(error) {
    //     console.error(error);
    //   });

    // // Get the most recent event
    //   helpers.getCurrentEvent()
    //     .then(function(model) {
    //       console.log(model.toJSON());
    //     })
    //     .catch(function(error) {
    //       console.error(error);
    //     });

    // // Get the participant ID for a device ID
    //   helpers.getParticipant('999')
    //     .then(function(model) {
    //       console.log(model.get('id'));
    //     })
    //     .catch(function(error) {
    //       console.error(error);
    //     })

    // // Get checkin status for a given event
    //   helpers.getCheckinStatus('999','1')
    //     .then(function(model) {
    //       console.log(model.toJSON());
    //     })
    //     .catch(function(error) {
    //       console.error(error);
    //     });

    // Checkin a user
      helpers.checkinUser('999')
        .then(function(model) {
          console.log(model.toJSON())
        })
        .catch(function(error) {
          console.error(error);
        })

  });



};
