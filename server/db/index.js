var config = require('../config/config');
var Promise = require('bluebird');

var knex = require('knex')({client: 'mysql', connection: config.mysqlConnection});
var bookshelf = require('bookshelf')(knex);

// Initialize database tables if they don't exist

var createTables = function() {

  bookshelf.knex.schema.hasTable('participants').then(function(exists) {
    if(!exists) {
      return bookshelf.knex.schema.createTable('participants',function(t) {
        t.increments('participant_id').primary();
        t.string('name');
        t.integer('device_id');
      });
    }
  });

  bookshelf.knex.schema.hasTable('admins').then(function(exists) {
    if(!exists) {
      return bookshelf.knex.schema.createTable('admins',function(t) {
        t.increments('admin_id').primary();
        t.string('name');
      });
    }
  });

  bookshelf.knex.schema.hasTable('events').then(function(exists) {
    if(!exists) {
      return bookshelf.knex.schema.createTable('events',function(t) {
        t.increments('event_id').primary();
        t.string('name');
        t.dateTime('start_time');
        t.integer('admin_id').notNullable().references('admin_id').inTable('admins');
      });
    }
  });

  bookshelf.knex.schema.hasTable('events_participants').then(function(exists) {
    if(!exists) {
      return bookshelf.knex.schema.createTable('events_participants',function(t) {
        t.increments('id').primary();
        t.integer('event_id').notNullable().references('event_id').inTable('events')
        t.integer('participant_id').notNullable().references('participant_id').inTable('participants');
        t.text('status');
      });
    }
  });
}

createTables();

var clearData = function() {
  bookshelf.knex('participants').del().return();
  bookshelf.knex('admins').del().return();
  bookshelf.knex('events_participants').del().return();
  bookshelf.knex('events').del().return();
  console.log("database cleared");
}

clearData();
// Define bookshelf models including relationships

var Admin = bookshelf.Model.extend({
  tableName: 'admins',
  events: function() {
    return this.hasMany(Event);
  }
});

var Participant = bookshelf.Model.extend({
  tableName: 'participants',
  events: function() {
    return this.belongsToMany(Event);
  }
});

var Event = bookshelf.Model.extend({
  tableName: 'events',
  participants: function() {
    return this.belongsToMany(Participant);
  },
  admin: function() {
    return this.belongsTo(Admin);
  }
});

var Event_Participant = bookshelf.Model.extend({
  tableName: 'events_participants',
  participants: function() {
    return this.belongsTo(Participant);
  },
  events: function() {
    return this.belongsTo(Event);
  },
});

// Insert new dummy data

// ADMINS

Admin.forge({name: 'Pira'}).save();

// PARTICIPANTS

var Participants = bookshelf.Collection.extend({
  model: Participant
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
  model: Event
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
  model: Event_Participant
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
  console.log(eventsParticipants);
  return eventsParticipants;
};

var eventsParticipants = Events_Participants.forge(generateEventsParticipants());

Promise.all(eventsParticipants.invoke('save')).then(function() {
  console.log("Event participants saved");
});

module.exports = bookshelf;
