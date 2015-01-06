var expect = require('chai').expect;
var request = require('request');

describe('REST API - GET', function() {

  it('Can get the beacons for a device id', function(done) {
    var deviceId = 999;
    var url = 'http://localhost:8080/api/devices/' + deviceId + '/beacons';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the beacons for a device id', function(done) {
    var participantId = 1;
    var url = 'http://localhost:8080/api/participants/' + participantId + '/events';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get event participants for a given eventId', function(done) {
    var eventId = 1;
    var url = 'http://localhost:8080/api/participants/' + eventId + '/events';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the current event for a participant', function(done) {
    var eventId = 1;
    var url = 'http://localhost:8080/api/participants/' + eventId + '/events/current';

    request(url, function(error, res, body) {
      expect(body.match(/Error/g)).to.equal(null);
      done();
    });
  });

  it('Can get all events for a given admin ID', function(done) {
    var adminId = 1;
    var url = 'http://localhost:8080/api/admins/' + adminId + '/events';
    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the admin name for a given admin ID', function(done) {
    var adminId = 1;
    var url = 'http://localhost:8080/api/admins/' + adminId;

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the participant info for a given device ID', function(done) {
    var deviceId = 999;
    var url = 'http://localhost:8080/api/devices/' + deviceId + '/participant';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the checkin status for a given device and event', function(done) {
    var deviceId = 999;
    var eventId = 1;
    var url = 'http://localhost:8080/api/devices/' + deviceId + '/events/' + eventId + '/status';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get all the beacons for a given admin', function(done) {
    var adminId = 1;
    var url = 'http://localhost:8080/api/admins/' + adminId + '/beacons';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});
