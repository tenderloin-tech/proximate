angular.module('proximate')

.controller('MainController', function($scope, PubNub, pubNubKeys) {
  if (!PubNub.initialized()) {
    PubNub.init({
      subscribe_key: pubNubKeys.sub,
      publish_key: pubNubKeys.pub
    });
  }
});

.controller('AdminCtrl', function($scope) {

})

.controller('eventCtrl', function($scope) {

})
