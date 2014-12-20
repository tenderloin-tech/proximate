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
  }
});

var Event = bookshelf.Model.extend({
  tableName: 'events',
  participants: function() {
    return this.belongsToMany(Participant).through(Event_Participant);
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
