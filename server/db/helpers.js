var models = require('../models');
var moment = require('moment');

var getEventParticipants = function(eventId) {

  return new models.EventsParticipants()
    .query({where:{event_id: eventId}})
    .fetch({require: true})
    .then(function(collection) {
      return collection;
    });

};

var getParticipant = function(deviceId) {

  return new models.Participant()
    .query({where: {device_id: deviceId}})
    .fetch({require: true})
    .then(function(model) {
      return model;
    });

};

var getCheckinStatus = function(deviceId, eventId) {

  var participant_id;

  console.log('deviceId', deviceId, 'eventId', eventId);

  return getParticipant(deviceId)
    .then(function(model) {
      participant_id = model.get('id');
    })
    .then(function() {
      return new models.EventsParticipants()
        .query({where:{participant_id: participant_id, event_id: eventId }})
        .fetch({require: true})
        .then(function(model) {
          return model;
        });
    });

};

var getCurrentEvent = function() {

  return new models.Event()
    .query('orderByRaw', 'ABS(UNIX_TIMESTAMP() - UNIX_TIMESTAMP(start_time)) ASC')
    .fetch({require:true})
    .then(function(model) {
        return model;
    });

};

var checkinUser = function(deviceId) {

  var eventId;
  var eventStartTime;
  var participantId;
  var status;
  var now = moment();

  var checkinStatus = function() {
    return getCheckinStatus(deviceId, eventId);
  }

  // Get the event_id of the closest event in time
  return getCurrentEvent()
  .then(function(model) {
    eventId = model.get('id');
    eventStartTime = moment(model.get('start_time'))

  })
  .then(checkinStatus())

  // Get the participant ID for this device ID
  .then(getParticipant.apply(this, [deviceId]))
  .then(function(model) {
    participantId = model.get('id');
  });

  // Get the checkin status for this device ID
  // .then()

  // // Update the checkin status
  // .then(function(model) {
  //   console.log(model);
  //   status = (eventStartTime.format('X') - now.format('X') >= 0) ? 'ontime' : 'late';
  //   if (model) {
  //   // Record exists, update it
  //     model.set('status', status);
  //     model.set('checkin_time', moment().format('YYYY-MM-DD HH:mm:ss'));
  //     model.save();
  //   } else {
  //   // Record doesn't exist, create it
  //     model = models.EventParticipant.forge({
  //       event_id: eventId,
  //       participant_id: participantId,
  //       status: status,
  //       checkin_time: now.format('YYYY-MM-DD HH:mm:ss')});
  //     model.save();
  //   }

  //   return model;

  // });

};

module.exports = {
  checkinUser: checkinUser,
  getEventParticipants: getEventParticipants,
  getCurrentEvent: getCurrentEvent,
  getCheckinStatus: getCheckinStatus,
  getParticipant: getParticipant
};
