angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope) {})

.controller('SettingsCtrl', function($scope, Beacons, PubNub) {
  $scope.settings = {
    enableFriends: true
  };

  angular.element(document).ready(function() {
    Beacons.setupTestBeacons(PubNub.publishRegionEntry);
  });

});
