angular.module('proximate.controllers', ['proximate.secrets'])

.controller('MainController', function($scope, PubNub, pubNubKeys) {
  if (!PubNub.initialized()) {
    PubNub.init({
      // jscs: disable requireCamelCaseOrUpperCaseIdentifiers
      subscribe_key: pubNubKeys.sub,
      publish_key: pubNubKeys.pub
      // jscs: enable requireCamelCaseOrUpperCaseIdentifiers
    });
  }

  // This is for testing only
  PubNub.ngPublish({
    channel: 'my_channel',
    message: 'angular reporting in'
  });
});
