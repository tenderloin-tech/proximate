var models = require('./models');
var helpers = require('./db/helpers');

module.exports = function(app) {

  /* API routes */

  // Sign a user in and register their device if needed
  app.post('/api/signin', function(req, res) {

    var email = req.body.email;
    var deviceId = req.body.deviceId;

    helpers.updateDeviceId(email, deviceId)
      .then(function(model) {
        res.status(201).send(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('No user found');
      });

  });

  // Return a list of beacons associated with events
  // that belong to a certain device ID
  app.get('/api/devices/:deviceId/beacons', function(req, res) {

    var deviceId = req.params.deviceId;

    new models.Participant()
      .query({where:{device_id: deviceId}})
      .fetch({withRelated:'events.beacons'})
      .then(function(model) {
        var beacons = model.related('events')
          .chain()
          .map(function(event) {
            return event.related('beacons')
              .map(function(beacon) {
                return JSON.stringify(beacon.pick(function(value, key) {
                  return !(/_pivot/.test(key));
                }));
              });
          })
          .flatten()
          .uniq()
          .value();

        res.json(beacons);
      });

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

  // Get all events for a given admin ID
  app.get('/api/admins/:adminId/events', function(req, res) {

    var adminId = req.params.adminId;

    helpers.getEventsByAdminId(adminId)
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('unable to fetch admin events data');
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
