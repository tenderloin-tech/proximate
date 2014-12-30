var bookshelf = require('./db/db');

// Define bookshelf models

module.exports = exports = {
  Admin: bookshelf.Model.extend({
    tableName: 'admins',
    events: function() {
      return this.hasMany(Event);
    }
  }),

  Participant: bookshelf.Model.extend({
    tableName: 'participants',
    events: function() {
      return this.belongsToMany(Event).through(EventParticipant);
    },
    status: function() {
      return this.hasMany(EventParticipant);
    }
  }),

  Event: bookshelf.Model.extend({
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
    }
  }),

  EventParticipant: bookshelf.Model.extend({
    tableName: 'events_participants',
    participant: function() {
      return this.belongsTo(Participant);
    },
    event: function() {
      return this.belongsTo(Event);
    }
  }),

  Beacon: bookshelf.Model.extend({
    tableName: 'beacons',
    events: function() {
      return this.belongsToMany(Event).through(beacons_events);
    }
  }),

  BeaconEvent: bookshelf.Model.extend({
    tableName: 'beacons_events',
    beacon: function() {
      return this.belongsTo(Beacon);
    },
    event: function() {
      return this.belongsTo(Event);
    }
  })
};

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
