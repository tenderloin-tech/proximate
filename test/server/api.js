/******************************************************************
* SEVER TEST
******************************************************************/
var http = require("http");

describe('REST API', function() {

  var serverUrl = 'http://localhost:8080/api/';
  var events = '';

  // Should get events for a given participant

  beforeEach(function() {

    $http({
      method: 'GET',
      url: serverUrl+'participants/1/events',
    })
    .then(function(data) {
      events = data;
      console.log(events);
      done();
    });

  });

  // Should register a user
  // Should get beacons for a given device
  // Should get events for a given participant
  // Should get participants for a given event
  // Should get info for the most current event ID
  // Should get participant info for a given device
  // Should get checkin status for a given device and

  it('Should get events for a participant', function() {
    expect(data.length).toBeGreaterThan(0);
  });

  xit('Should register a user', function() {
    // var randomId = Math.floor(Math.random*10000);
    // var postData = {};

    // $http({
    //   method: 'POST',
    //   url: webServer.url + '/api/devices/register',
    //   data: {
    //     username: 'czasato@gmail.com',
    //     deviceId: randomId,
    //   }
    // }).then(function(data) {

    //   flag = true;
    //   console.log(data);
    // }).catch(function(err) {
    //   console.log(err);
    // });

    // return flag;

    //    expect(1).toEqual(2);

  });

});
