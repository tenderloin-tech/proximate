angular.module('proximate')

.controller('MainController', function($scope, PubNub, pubNubKeys) {
  if (!PubNub.initialized()) {
    PubNub.init({
      subscribe_key: pubNubKeys.sub,
      publish_key: pubNubKeys.pub
    });
  }
})

.controller('AdminCtrl', function($scope) {

})

.controller('EventCtrl', function($scope) {
  var updateClock = function() {
    $scope.clock = new Date();
  };
  var timer = setInterval(function() {
    $scope.$apply(updateClock);
  }, 1000);
  updateClock();
});
