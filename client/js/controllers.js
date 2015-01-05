angular.module('proximate.controllers', [])

.controller('EventsSummaryCtrl', function() {

})

.controller('AdminCtrl', function() {

})

.controller('EventCtrl', function($scope) {

  var updateClock = function() {
    $scope.clock = new Date();
  };

  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();

})

.controller('LoginCtrl', function($http, $scope, $state, googleKeys) {
  $scope.signinCallback = function(authResult) {
    if (authResult.code) {
      // Send the code to the server
      $http({
        method: 'POST',
        url: 'api/token',
        data: {
          code: authResult.code,
          state: stateToken
        },
      }).then(function(result) {
        // Render admin view
        $state.go('admin');
      }).catch(function(err) {
        console.log(err);
      });
    } else if (authResult.error) {
      console.log('User not authenticated: ', authResult.error);
    }
  };

  $scope.renderSignIn = function() {
    gapi.signin.render('signinButton', {
      'callback': $scope.signinCallback,
      'clientid': googleKeys.clientId,
      'scope': 'email profile https://www.googleapis.com/auth/calendar.readonly',
      'cookiepolicy': 'single_host_origin',
      'accesstype': 'offline'
    });
  };
  // Load the G+ API
  var po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://plus.google.com/js/client:plusone.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);

  po.onload = $scope.renderSignIn;
});
