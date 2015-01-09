angular.module('proximate.auth', [])

.factory('authInterceptor', function($q, $window) {
  return {
    request: function(config) {
      config.headers = config.headers || {};

      if ($window.sessionStorage.idToken) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.idToken;
      }

      return config;
    },
    responseError: function(err) {
      if (err.status === 401) {
        console.log('Authentication error');
      }

      return $q.reject(err);
    }
  };
})

.factory('Auth', function($http, $state, $window) {
  return {

    isAuth: function() {
      return !!$window.sessionStorage.idToken;
    },

    signinCallback: function(authResult) {
      console.log('Received client tokens: ', authResult);
      if (authResult.code && authResult.id_token) {
        // Send the code to the server
        $http({
          method: 'POST',
          url: 'api/token',
          data: {
            code: authResult.code,
            idToken: authResult.id_token,
            state: stateToken
          },
        }).then(function(result) {
          $window.sessionStorage.idToken = authResult.id_token;
          // Render events view
          $http({
            method: 'GET',
            url: 'test'
          }).then(function(res) {
            console.log(res);
          });
          $state.go('events');
        }).catch(function(err) {
          console.log(err);
        });
      } else if (authResult.error) {
        console.log('User not authenticated: ', authResult.error);
      }
    },

    signOut: function() {
      delete $window.sessionStorage.idToken;
    }

  };
})

.controller('LoginCtrl', function($http, $scope, googleKeys, Auth) {
  angular.extend($scope, Auth);

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
