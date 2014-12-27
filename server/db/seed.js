var promise = require('bluebird');
var models = require('../models');
var moment = require('moment');


var getDeviceId = function(name) {



}

var checkinUser = function(deviceID) {

  var participantId;
  var eventId;
  var startTime;
  var status;
  var now = moment();

  // Get the participant_id from the deviceID
  var user = new models.Participant({device_id:deviceID})
    .fetch()
    .then(function(model) {
      participantId = model.get('id');
    })

    // Get the event_id of the closest event in time
    .then(function(){
      new models.Event()
        .query('orderByRaw', 'ABS(UNIX_TIMESTAMP() - UNIX_TIMESTAMP(start_time)) ASC')
        .fetch()
        .then(function(model) {
          eventId = model.get('id');
          startTime = moment(model.get('start_time'));

        // Update the event_participant status if needed
        }).then(function(model){
          status = (startTime.format('X') - now.format('X') >= 0) ? 'ontime' : 'late';
          new models.EventParticipant({event_id: eventId, participant_id: participantId})
            .fetch()
            .then(function(model) {
              model.set('status', status);
              model.set('checkin_time', moment().format('YYYY-MM-DD HH:mm:ss'));
              model.save();
            });
      });
    });
}


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
    checkinUser('343');
  });

};


