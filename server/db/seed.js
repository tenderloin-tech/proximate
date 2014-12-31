var promise = require('bluebird');
var models = require('../models');

exports.seedTables = function() {

  models.Admin.forge({name: 'Pira'}).save();

  var participants = models.Participants.forge([
    {email: 'tantai.john@gmail.com', name: 'John Tan', device_id: '999'},
    {email: 'davidraleigh@gmail.com', name: 'David Raleigh'},
    {email: 'sunny.gonna@gmail.com', name: 'Sunny Gonnabathula'},
    {email: 'lom.michael@gmail.com', name: 'Michael Lom'},
    {email: 'ichitopolo@gmail.com', name: 'Rene Polo'},
    {email: 'sgtonkin@gmail.com', name: 'Sebastian Tonkin'},
    {email: 'rustinpc@gmail.com', name: 'Rustin Crandall'},
    {email: 'brettleibo@gmail.com', name: 'Brett Leibowitz'},
    {email: 'xelad1@gmail.com', name: 'Alex Dajani'},
    {email: 'arfurboy@gmail.com', name: 'Arthur Chan'},
    {email: 'robertn702@gmail.com', name: 'Robert Niimi'},
    {email: 'bernard.chu@yahoo.com', name: 'Bernard Chu'},
    {email: 'ballaneyster@gmail.com', name: 'Nikhil Ballaney'},
    {email: 'mochicat8@gmail.com', name: 'Judy Zaratan'},
    {email: 'zindlerb@gmail.com', name: 'Brian Zindler'},
    {email: 'tim.hua@icloud.com', name: 'Tim Hua'},
    {email: 'rick@theparkmart.com', name: 'Rick Takes', device_id: '000'},
    {email: 'rsison87@gmail.com', name: 'Rachel Sison'},
    {email: 'azotova@gmail.com', name: 'Anastasia Zotova'},
    {email: 'ow.diehl@gmail.com', name: 'Owen Diehl'},
    {email: 'poison5151@gmail.com', name: 'Valentyn Boginskey'},
    {email: 'avidunn@gmail.com', name: 'Avi Dunn'},
    {email: 'raymondxma@gmail.com', name: 'Raymond Ma'},
    {email: 'issac_pao@sbcglobal.net', name: 'Issac Pao'},
    {email: 'mamamia1734@gmail.com', name: 'Derek Wu'},
    {email: 'dduugg@gmail.com', name: 'Douglas Eichelberger'},
    {
      email: 'derek.barncard@gmail.com',
      name: 'Derek Barncard',
      device_id: 'B19A9282-3124-4A3D-A387-60B4E92F22AF'
    },
    {email: 'christian.manuel.perez', name: 'Chris Perez'},
    {email: 'pioneerlike@gmail.com', name: 'Dennis Lin'},
    {email: 'lizport10@gmail.com', name: 'Liz Portnoy'},
    {email: 'czasato@gmail.com', name: 'Cory Asato'}
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
