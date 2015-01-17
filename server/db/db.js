var config = require('../config/config');
var knex = require('knex')({
  client: 'mysql',
  connection: config.mysqlConnection,
});
var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;
var sync = require('./sync');

if (config.resetDatabaseOnLoad) {
  // Drop any existing db tables to ensure increment values reset
  bookshelf.knex.schema.dropTableIfExists('participants')
  .then(function() {
    return bookshelf.knex.schema.dropTableIfExists('events');
  })
  .then(function() {
    return bookshelf.knex.schema.dropTableIfExists('admins');
  })
  .then(function() {
    return bookshelf.knex.schema.dropTableIfExists('events_participants');
  })
  .then(function() {
    return bookshelf.knex.schema.dropTableIfExists('beacons');
  })
  .then(function() {
    return bookshelf.knex.schema.dropTableIfExists('beacons_events');
  })

  // Create our tables
  .then(function() {
    return bookshelf.knex.schema.createTable('admins', function(t) {
      t.increments('id').primary();
      t.string('name');
      t.string('email');
      t.string('refresh_token');
      t.string('access_token');
      t.bigInteger('token_expiry');
      t.dateTime('created_at');
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('participants', function(t) {
      t.increments('id').primary();
      t.string('name');
      t.string('email');
      t.string('device_id').unique();
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('events', function(t) {
      t.increments('id').primary();
      t.string('gcal_id');
      t.text('name');
      t.string('location');
      t.string('htmlLink');
      t.string('recurring_event_id');
      t.dateTime('start_time');
      t.dateTime('updated');
      t.string('status');
      t.integer('admin_id').notNullable();
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('events_participants', function(t) {
      t.increments('id').primary();
      t.integer('event_id').notNullable();
      t.integer('participant_id').notNullable();
      t.string('status');
      t.string('gcal_response_status');
      t.string('gcal_id');
      t.dateTime('checkin_time');
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('beacons', function(t) {
      t.increments('id').primary();
      t.string('uuid');
      t.string('identifier');
      t.integer('major');
      t.integer('minor');
      t.integer('admin_id').notNullable();
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('beacons_events', function(t) {
      t.increments('id').primary();
      t.integer('beacon_id');
      t.integer('event_id');
    });
  });

}
