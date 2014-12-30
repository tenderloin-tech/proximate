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
    {name: 'Derek Barncard', device_id: 'B19A9282-3124-4A3D-A387-60B4E92F22AF'},
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
    for (var i = 1; i < 32; i++) {
      for (var j = 1; j < 10; j++) {
        eventsParticipants.push(
          {
            participant_id: i,
            event_id: j,
            status: status,
            checkin_time: '2014-12-03 12:00:00'
          }
        );
        status = (status === 'ontime') ? 'late' : 'ontime';
      }
      for (j = 10; j < 32; j++) {
        eventsParticipants.push(
          {
            participant_id: i,
            event_id: j
          }
        );
      }
    }
    return eventsParticipants;
  };

  var eventsParticipants = models.EventsParticipants.forge(generateEventsParticipants());

  promise.all(eventsParticipants.invoke('save')).then(function() {
  });

  // BEACONS

  var beacons = models.Beacons.forge([
  {
    uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    identifier : 'Estimote Icy One',
    minor : 10907,
    major : 23516,
    admin_id : 1
  }, {
    uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    identifier : 'Estimote Blue One',
    minor : 50306,
    major : 54690,
    admin_id : 1
  }, {
    uuid : 'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
    identifier : 'Estimote Mint One',
    minor : 3704,
    major : 57868,
    admin_id : 1
  }]);

  promise.all(beacons.invoke('save')).then(function() {
  });

  var generateBeaconEvents = function() {
    var results = [];

    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 10; j++) {
        results.push({
          event_id: j,
          beacon_id: i
        });
      }
    }

    return results;
  };

  var beaconsEvents = models.BeaconsEvents.forge(generateBeaconEvents());

  promise.all(beaconsEvents.invoke('save')).then(function() {
  });

};
