var models = require('./models');
var helpers = require('./db/helpers');

module.exports = function(app) {

  /* API routes */

  // Register a deviceId to a participant
  // Expect body of the request to contain:
  // {deviceId: 'B19A9282-3124-4A3D-A387-60B4E92F22AF', username: 'Meat puppet'}
  app.post('/api/devices/register', function(req, res) {

    new models.Participant({
        name: req.body.username,
        deviceId: req.body.deviceId
      })
      .save()
      .then(function() {
        res.status(200).send();
      }, function() {
        res.status(404).send('Invalid username');
      });

  });

  // Return a list of beacons for a participant
  // Expect body of the request to contain:
  // {username: 'Meat puppet'}
  // This should fetch from the DB in the future
  app.get('/api/beacons/:deviceId', function(req, res) {

    var deviceId = req.params.deviceId;
    var testRegions = [{
        uuid : 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
        identifier : 'Apple AirLocate E2C56DB5',
        minor : 1000,
        major : 5
      }];

    console.log('Sending: ' + testRegions);
    res.json(testRegions);

  });

  // Return a list of events for a participant
  app.get('/api/events/:participantId', function(req, res) {

    var participantId = req.params.participantId;

    new models.Participant({
      id: participantId
    })
      .fetch({withRelated: ['events'], require: true})
      .then(function(participant) {
        res.json(participant.related('events').toJSON());
      }, function() {
        res.status(404).send('Invalid username');
      });

  });

  // Get event participants for a given eventId
  app.get('/api/events/participants/:eventId', function(req, res) {

    var eventId = req.params.eventId;

    helpers.getEventParticipants(eventId)
    .then(function(model) {
      res.json(model.toJSON());
    })
    .catch(function(error) {
      res.send('Invalid event ID');
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
  app.get('/api/participants/devices/:deviceId', function(req, res) {

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
  app.get('/api/participants/status/:deviceId/:eventId', function(req, res) {

    var deviceId = req.params.deviceId;
    var eventId = req.params.eventId;

    helpers.getCheckinStatus('999', '1')
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch checkin status');
      });

  });

};
