var models = require('./models');
var helpers = require('./db/helpers')

module.exports = function(app) {

  /* API routes */

  // Register a deviceId to a participant
  // Expect body of the request to contain:
  // {deviceId: 'B19A9282-3124-4A3D-A387-60B4E92F22AF', username: 'Meat puppet'}
  app.post('/api/register', function(req, res) {
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
  app.post('/api/beacons', function(req, res) {
    console.log('%s requested beacons', req.body.username);

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
  // Expect body of the request to contain:
  // {username: 'Meat puppet'}
  app.post('/api/events', function(req, res) {
    new models.Participant({
      name: req.body.username
    })
      .fetch({withRelated: ['events'], require: true})
      .then(function(participant) {
        res.json(participant.related('events').toJSON());
      }, function() {
        res.status(404).send('Invalid username');
      });
  });

  // Get event participants for a given eventId
  app.get('/api/participants/:eventId', function(req, res) {

    var eventId = req.params.eventId;

     helpers.getEventParticipants(eventId)
    .then(function(model) {
      res.json(model.toJSON());
    })
    .catch(function(error) {
      res.send("Invalid event ID");
    });

  });
};
