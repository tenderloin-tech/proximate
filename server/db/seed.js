var promise = require('bluebird');

module.exports = seedTables = function() {

  models.Admin.forge({name: 'Pira'}).save();

  var Participants = bookshelf.Collection.extend({
    model: models.Participant
  });

  var participants = Participants.forge([
    {name: 'John Tan'},
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

  Promise.all(participants.invoke('save')).then(function() {
    console.log("Participants saved");
  });

  // EVENTS

  var Events = bookshelf.Collection.extend({
    model: models.Event
  });

  var events = Events.forge([
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
      start_time: '2014-01-02 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-01-03 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-01-05 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-01-06 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-01-07 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-01-08 09:00:00',
      admin_id: 1
    }, {
      name: 'Kickoff',
      start_time: '2014-01-09 09:00:00',
      admin_id: 1
    }
  ]);

  Promise.all(events.invoke('save')).then(function() {
    console.log("Events saved");
  });

  // EVENT PARTICIPANTS

  var Events_Participants = bookshelf.Collection.extend({
    model: models.Event_Participant
  });

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

  var eventsParticipants = Events_Participants.forge(generateEventsParticipants());

  Promise.all(eventsParticipants.invoke('save')).then(function() {
    console.log("Event participants saved");
  });

}
