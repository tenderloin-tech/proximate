angular.module('proximate.controllers', [])

.controller('MainController', function($scope, PubNub) {
  if (!PubNub.initialized()) {
    PubNub.init({
      subscribe_key: 'sub-c-55cc2d3c-8617-11e4-a77a-02ee2ddab7fe',
      publish_key: 'pub-c-e3770297-47d1-4fe9-9c34-cfee91f9fa9c'
    });
  }

  // This is for testing only
  PubNub.ngPublish({
    channel: 'my_channel',
    message: 'angular reporting in'
  });
});
