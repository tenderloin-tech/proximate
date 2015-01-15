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

.factory('Auth', function($http, $rootScope, $state, $window) {
  return {

    isAuth: function() {
      return !!$window.sessionStorage.idToken;
    },

    signinCallback: function(authResult) {
      if (authResult.code && authResult.id_token) {
        console.log('Received client-side tokens');
        // Assume this is valid
        $window.sessionStorage.idToken = authResult.id_token;
        // Send the code to the server
        $http({
          method: 'POST',
          url: 'api/token',
          data: {
            code: authResult.code,
            idToken: authResult.id_token
          },
        }).then(function(res) {
          $window.sessionStorage.name = res.data.name;
          $window.sessionStorage.email = res.data.email;
          // Render events view
          $rootScope.$broadcast('auth-login-success');
          $state.go('admin.events');
        }).catch(function(err) {
          // Server rejected this token, unset it
          delete $window.sessionStorage.idToken;
          console.log(err);
        });
      } else if (authResult.error) {
        console.log('User not authenticated: ', authResult.error);
      }
    },

    signOut: function() {
      delete $window.sessionStorage.idToken;
      $state.go('login');
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
      'accesstype': 'offline',
      'width': 'wide',
      'height': 'tall'
    });
  };

  if ($scope.gapi_loaded) {
    $scope.renderSignIn();
  }

  $scope.$on('google-api-loaded', $scope.renderSignIn);

});
