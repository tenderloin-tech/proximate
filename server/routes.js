var models = require('./models');
var helpers = require('./db/helpers');

module.exports = function(app) {

  /* API routes */

  // Register a deviceId to a participant
  app.post('/api/devices/register', function(req, res) {

    var username = req.body.username;
    var deviceId = req.body.deviceId;

    console.log('username', username, 'deviceId', deviceId);

    helpers.updateDeviceId(username, deviceId)
      .then(function(model) {
        res.status(201).send('Device registered');
      })
      .catch(function(error) {
        res.status(404).send('Unable to register device');
      });

  });

  // Return a list of beacons associated with events
  // that belong to a certain device ID
  app.get('/api/devices/:deviceId/beacons', function(req, res) {

    var deviceId = req.params.deviceId;
    var testRegions = [{
        uuid : 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
        identifier : 'Apple AirLocate E2C56DB5',
        minor : 1000,
        major : 5
      }];

    res.json(testRegions);

  });

  // Return a list of events for a participant
  app.get('/api/participants/:participantId/events', function(req, res) {

    var participantId = req.params.participantId;

    helpers.getEvents(participantId)
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch events for this participant');
      });

  });

  // Get event participants for a given eventId
  app.get('/api/events/:eventId/participants', function(req, res) {

    var eventId = req.params.eventId;

    helpers.getEventParticipants(eventId)
    .then(function(model) {
      res.json(model.toJSON());
    })
    .catch(function(error) {
      res.status(404).send('Invalid event ID');
    });

  });

  // Get info for the most current event from the db
  app.get('/api/events/current', function(req, res) {

    helpers.getCurrentEvent()
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch current event data');
      });

  });

  // Get the participant info for a given device ID
  app.get('/api/devices/:deviceId/participant', function(req, res) {

    var deviceId = req.params.deviceId;

    helpers.getParticipant(deviceId)
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch participant info');
      });

  });

  // Get the checkin status for a given device and event
  app.get('/api/devices/:deviceId/events/:eventId/status', function(req, res) {

    var deviceId = req.params.deviceId;
    var eventId = req.params.eventId;

    helpers.getCheckinStatus(deviceId, eventId)
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch checkin status');
      });

  });

};
