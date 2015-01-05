var crypto = require('crypto');
var google = require('googleapis');

var config = require('./config/config');
var models = require('./models');
var helpers = require('./db/helpers');

module.exports = function(app) {

  /* Client routes */

  app.get('/', function(req, res) {
    // Create anti-CSRF token
    var stateToken = crypto.randomBytes(48).toString('hex');
    // Render template with token
    res.render('index', {state: stateToken});
    // Store token in session
    req.session.state = stateToken;
  });

  /* API routes */

  // Receive one-time Google+ authorization code
  app.post('/api/token', function(req, res) {
    // Confirm anti-CSRF token validity
    console.log('Checking CSRF state token ...');
    console.log('Server: ', req.session.state);
    console.log('Client: ', req.body.state);

    if (!req.session.state || !req.body.state || req.session.state !== req.body.state) {
      res.status(401).send('Authentication error');
      return;
    }
    // State token is valid
    // Initialize OAuth2 client
    var oauth2 = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      'postmessage'
    );
    // Exchange one-time code for tokens
    oauth2.getToken(req.body.code, function(err, tokens) {
      if (!err) {
        oauth2.setCredentials(tokens);
        res.status(200).send();
      } else {
        console.log('Unable to exchange code for tokens: ', err);
        res.status(401).send('Authentication error');
      }
    });
  });

  // Sign a user in and register their device if needed
  app.post('/api/signin', function(req, res) {

    var email = req.body.email;
    var deviceId = req.body.deviceId;

    helpers.updateDeviceId(email, deviceId)
      .then(function(model) {
        res.status(201).send(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('No user found', error);
      });

  });

  app.post('/api/admin/create', function(req, res) {

    var email = req.body.email;
    var name = req.body.name;

    helpers.createAdmin('sgtonkin@gmail.com', 'Sebastian Tonkin')
      .then(function(admin) {
        res.status(201).send(admin.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Error creating admin', error)
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
        res.status(404).send('Unable to fetch events for this participant ', error);
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
      res.status(404).send('Invalid event ID ', error);
    });

  });

  // Get info for the most current event from the db
  app.get('/api/events/current', function(req, res) {

    helpers.getCurrentEvent()
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch current event data ', error);
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
        res.status(404).send('Unable to fetch admin events data ', error);
      });

  });

  // Get the admin name for a given admin ID
  app.get('/api/admins/:adminId', function(req, res) {

    var adminId = req.params.adminId;

    helpers.getAdminName(adminId)
      .then(function(model) {
        res.json(model.toJSON());
      })
      .catch(function(error) {
        res.status(404).send('Unable to fetch admin name ', error);
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
        res.status(404).send('Unable to fetch participant info ', error);
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
        res.status(404).send('Unable to fetch checkin status ', error);
      });

  });

};
