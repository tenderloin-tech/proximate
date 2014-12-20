var config = require('./config/config');
var knex = require('knex')({client: 'mysql', connection: config.mysqlConnection});
var bookshelf = require('bookshelf')(knex);

// Define bookshelf models

var Admin = bookshelf.Model.extend({
  tableName: 'admins',
  events: function() {
    return this.hasMany(Event);
  }
});

var Participant = bookshelf.Model.extend({
  tableName: 'participants',
  events: function() {
    return this.hasMany(Event).through(Event_Participant);
  },
  status: function() {
    return this.hasMany(Event_Participant);
  }
});

var Event = bookshelf.Model.extend({
  tableName: 'events',
  participants: function() {
    return this.belongsToMany(Participant).through(Event_Participant);
  },
  admin: function() {
    return this.belongsTo(Admin);
  },
  status: function() {
    return this.hasMany(Event_Participant);
  }
});

var Event_Participant = bookshelf.Model.extend({
  tableName: 'events_participants',
  participant: function() {
    return this.belongsTo(Participant);
  },
  event: function() {
    return this.belongsTo(Event);
  }
});

// Define bookshelf collections

var Events_Participants = bookshelf.Collection.extend({
  model: Event_Participant
});

var Events = bookshelf.Collection.extend({
  model: Event
});

var Participants = bookshelf.Collection.extend({
  model: Participant
});

module.exports = {
  Admin: Admin,
  Participant: Participant,
  Participants: Participants,
  Event: Event,
  Events: Events,
  Event_Participant: Event_Participant,
  Events_Participants: Events_Participants
}
