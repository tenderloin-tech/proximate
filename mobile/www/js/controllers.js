angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope, Beacons, PubNub) {
  angular.element(document).ready(function() {
    Beacons.setupTestBeacons(PubNub.publishRegionEntry);
  });

});
