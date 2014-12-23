var models = require('./models');

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

  // Similar to the above, this endpoint is also a test stem.
  // The real call should serve appropriate beacons based on the
  // supplied req.body.username and req.body.deviceId

  app.get('/api/beacons', function(req, res) {

    var testRegions = [{
        uuid : 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
        identifier : 'Apple AirLocate E2C56DB5',
        minor : 1000,
        major : 5
      }];

    console.log('Sending: ' + testRegions);
    res.json(testRegions);
  });

};
