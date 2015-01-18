angular.module('proximate.services')

.factory('Auth', function($localStorage, $state, $http, webServer, Beacons) {

  // Stem function - for now just destroys the 'registered' state
  var logout = function() {
    $localStorage.set('initialized', 'false');
    Beacons.clearBeacons();
    $state.go('splash');
  };

  return {
    logout: logout
  };
});
