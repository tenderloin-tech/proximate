angular.module('proximate.services')

.factory('Events', function($http, webServer, Settings) {
  var getMostCurrentEvent = function() {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/events/current'
    }).then(function(res) {
      return res.data;
    });
  };

  var getEventCheckinStatus = function(eventId) {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/devices/' + Settings.data.deviceId +
        '/events/' + eventId + '/status'
    }).then(function(res) {
      return res.data[0];
    });
  };

  var getUpcomingEvents = function() {
    return $http({
      method: 'GET',
      url: webServer.url + '/api/participants/' +
        Settings.userId + '/events'
    }).then(function() {
      return res.data;
    });
  };

  return {
    getMostCurrentEvent: getMostCurrentEvent,
    getEventCheckinStatus: getEventCheckinStatus,
    getUpcomingEvents: getUpcomingEvents
  };
});
