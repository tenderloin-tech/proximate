angular.module('proximate.controllers', [])

.controller('StatusCtrl', function($scope) {

})

.controller('SettingsCtrl', function($scope, Beacons, PubNub, Settings) {

    Settings.updateDeviceId();

    angular.element(document).ready(function() {

        Beacons.setupTestBeacons(PubNub.publish);

        $scope.data = Settings.data;

        setTimeout(function(){
          Settings.updateDeviceId();
          $scope.deviceId = Settings.deviceId;
        },1000);

    });

    $scope.updateUsername = function(){
        Settings.updateUsername($scope.data.username);
    }

});
