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

  var participantId;
  var eventId;
  var eventStartTime;
  var status;
  var now = moment();

  // Get the participant_id from the deviceID
  var user = new models.Participant({device_id: deviceId})
    .fetch({require:true})
    .then(function(model) {
      participantId = model.get('id');
    })

    // Get the event_id of the closest event in time
    .then(function() {
      new models.Event()
        .query('orderByRaw', 'ABS(UNIX_TIMESTAMP() - UNIX_TIMESTAMP(start_time)) ASC')
        .fetch()
        .then(function(model) {
          eventId = model.get('id');
          eventStartTime = moment(model.get('start_time'));

        // Update the event_participant status and check-in time
        }).then(function(model) {
          status = (eventStartTime.format('X') - now.format('X') >= 0) ? 'ontime' : 'late';
          new models.EventParticipant({event_id: eventId, participant_id: participantId})
            .fetch()
            .then(function(model) {
              if (model) {
              // Record exists, update it
                model.set('status', status);
                model.set('checkin_time', moment().format('YYYY-MM-DD HH:mm:ss'));
                model.save();
              } else {
              // Record doesn't exist, create it
                models.EventParticipant.forge({
                  event_id: eventId,
                  participant_id: participantId,
                  status: status,
                  checkin_time: now.format('YYYY-MM-DD HH:mm:ss')})
                .save();
              }
              console.log(
                'User_id ' + participantId +
                ' checked in ' + status +
                ' for event_id ' + eventId
              );
            });
        });
    })

    .catch(function(error) {
      console.error('An error occured checking in the user', error);
    });
};

module.exports = {
  checkinUser: checkinUser,
  getEventParticipants: getEventParticipants,
  getCurrentEvent: getCurrentEvent,
  getCheckinStatus: getCheckinStatus,
  getParticipant: getParticipant
};
