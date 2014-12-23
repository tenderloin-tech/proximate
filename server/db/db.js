var config = require('../config/config');
var knex = require('knex')({
  client: 'mysql',
  connection: config.mysqlConnection,
  debug: true
});
var bookshelf = require('bookshelf')(knex);
// Export database connection for reuse
module.exports = bookshelf;

var seed = require('./seed');

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
    return bookshelf.knex.schema.dropTableIfExists('eventsParticipants');
  })

  // Create our tables
  .then(function() {
    return bookshelf.knex.schema.createTable('admins', function(t) {
      t.increments('adminId').primary();
      t.string('name');
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('participants', function(t) {
      t.increments('participantId').primary();
      t.string('name');
      t.integer('deviceId').unique();
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('events', function(t) {
      t.increments('eventId').primary();
      t.string('name');
      t.dateTime('startTime');
      t.integer('adminId').notNullable();
    });
  })
  .then(function() {
    return bookshelf.knex.schema.createTable('eventsParticipants', function(t) {
      t.increments('id').primary();
      t.integer('eventId').notNullable();
      t.integer('participantId').notNullable();
      t.text('status');
    });
  })

  // Once our tables have been created, fill them with data
  .then(seed.seedTables);

}
