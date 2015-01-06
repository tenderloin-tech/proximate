var expect = require('chai').expect;
var request = require('request');

describe('REST API - GET', function() {

  var testData = {
    adminId: 1,
    deviceId: 999,
    participantId: 1,
    eventId: 1,
  };

  it('Can get the beacons for a device id', function(done) {
    var url = 'http://localhost:8080/api/devices/' + testData.deviceId + '/beacons';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the beacons for a device id', function(done) {
    var url = 'http://localhost:8080/api/participants/' + testData.participantId + '/events';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get event participants for a given testData.eventId', function(done) {
    var url = 'http://localhost:8080/api/participants/' + testData.eventId + '/events';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the current event for a participant', function(done) {
    var url = 'http://localhost:8080/api/participants/' + testData.eventId + '/events/current';

    request(url, function(error, res, body) {
      expect(body.match(/Error/g)).to.equal(null);
      done();
    });
  });

  it('Can get all events for a given admin ID', function(done) {
    var url = 'http://localhost:8080/api/admins/' + testData.adminId + '/events';
    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the admin name for a given admin ID', function(done) {
    var url = 'http://localhost:8080/api/admins/' + testData.adminId;

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the participant info for a given device ID', function(done) {
    var url = 'http://localhost:8080/api/devices/' + testData.deviceId + '/participant';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get the checkin status for a given device and event', function(done) {
    var url = 'http://localhost:8080/api/devices/' +
    testData.deviceId + '/events/' + testData.eventId + '/status';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('Can get all the beacons for a given admin', function(done) {
    var url = 'http://localhost:8080/api/admins/' + testData.adminId + '/beacons';

    request(url, function(error, res, body) {
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

});
