angular.module('proximate.services')

.factory('Auth', function($localStorage, $state, $http, webServer) {

  // Stem function - for now just destroys the 'registered' state
  var logout = function() {
    $localStorage.set('initialized', 'false');
    $state.go('splash');
  };

  return {
    logout: logout
  };
});
