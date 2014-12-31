var bookshelf = require('./db/db');

// Define bookshelf models

exports.Admin = bookshelf.Model.extend({
  tableName: 'admins',
  events: function() {
    return this.hasMany(Event);
  }
});

exports.Participant = bookshelf.Model.extend({
  tableName: 'participants',
  events: function() {
    return this.belongsToMany(Event).through(EventParticipant);
  },
  status: function() {
    return this.hasMany(EventParticipant);
  }
});

exports.Event = bookshelf.Model.extend({
  tableName: 'events',
  participants: function() {
    return this.belongsToMany(Participant)
      .through(EventParticipant)
      .withPivot(['status', 'checkin_time']);
  },
  admin: function() {
    return this.belongsTo(Admin);
  },
  status: function() {
    return this.hasMany(EventParticipant);
  },
  beacons: function() {
    this.belongsToMany(Beacon).through(beacons_events);
  }
});

exports.EventParticipant = bookshelf.Model.extend({
  tableName: 'events_participants',
  participant: function() {
    return this.belongsTo(Participant);
  },
  event: function() {
    return this.belongsTo(Event);
  }
});

exports.Beacon = bookshelf.Model.extend({
  tableName: 'beacons',
  events: function() {
    return this.belongsToMany(Event).through(beacons_events);
  }
});

exports.BeaconEvent = bookshelf.Model.extend({
  tableName: 'beacons_events',
  beacon: function() {
    return this.belongsTo(Beacon);
  },
  event: function() {
    return this.belongsTo(Event);
  }
});

// Define bookshelf collections

exports.EventsParticipants = bookshelf.Collection.extend({
  model: exports.EventParticipant
});

exports.Events = bookshelf.Collection.extend({
  model: exports.Event
});

exports.Beacons = bookshelf.Collection.extend({
  model: exports.Beacon
});

exports.BeaconsEvents = bookshelf.Collection.extend({
  model: exports.BeaconEvent
});

exports.Participants = bookshelf.Collection.extend({
  model: exports.Participant
});
