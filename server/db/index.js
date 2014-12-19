var config = require('../config/config');

var knex = require('knex')({client: 'mysql', connection: config.mysqlConnection});
var bookshelf = require('bookshelf')(knex);

// Initialize database tables if they don't exist

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

bookshelf.knex.schema.hasTable('event_participants').then(function(exists) {
  if(!exists) {
    return bookshelf.knex.schema.createTable('event_participants',function(t) {
      t.increments('id').primary();
      t.integer('event_id').notNullable().references('event_id').inTable('events')
      t.integer('participant_id').notNullable().references('participant_id').inTable('participants');
      t.text('status');
    });
  }
});

// Define bookshelf models

var Participant = bookshelf.Model.extend({
  tableName: 'participants'
});

new Participant()
  .save({name: 'Seb', device_id: '1'});

module.exports = bookshelf;