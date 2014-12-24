angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope, Beacons, PubNub, Settings) {

  //waits for the view to load so as to not interrupt the html/css
  angular.element(document).ready(function() {

    Beacons.setupTestBeacons(PubNub.publish);

    $scope.data = Settings.data;

  });

  /* scope functions */

  $scope.updateUsername = function() {
    Settings.updateUsername($scope.data.username);
  };

});
