var models = require('../models');
var moment = require('moment');

// POST HELPERS

exports.updateDeviceId = function(email, deviceId) {

  return new models.Participant()
    .query({where: {email: email}})
    .fetch({require:true})
    .then(function(model) {
      model.set('device_id', deviceId);
      model.save();
      return model;
    });

};

exports.upsertAdmin = function(email, name) {

  return models.Admin
    .forge(
      {
        name: name,
        email: email,
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }
    )
    .save();

}

exports.upsertBeacon = function(beaconInfo, beaconId) {

  // Beacon exists, update it
  if(beaconId) {
    return new models.Beacon({id: beaconId})
      .fetch()
      .then(function(beacon) {
        return beacon.save(beaconInfo);
      });
  }
  // New beacon, create it
  return models.Beacon.forge(beaconInfo).save()

}



// GET HELPERS

exports.getBeacons = function(eventId) {

  return new models.Events()
    .query({where: {event_id: eventId}})
    .fetch({withRelated: ['beacons'], require: true})
    .then(function(events) {
      return events.related('beacons');
    });

};

exports.getEvents = function(participantId) {

  return new models.Participant()
    .query({where: {id: participantId}})
    .fetch({withRelated: ['events'], require: true})
    .then(function(model) {
      return model;
    });

};

exports.getAdminName = function(adminId) {

  return new models.Admin()
    .query({where: {id: adminId}})
    .fetch({require: true})
    .then(function(model) {
      return model;
    });

};

exports.getEventsByAdminId = function(adminId) {

  return new models.Events()
    .query({where: {admin_id: adminId}})
    .fetch({require: true})
    .then(function(collection) {
      return collection;
    });

};

exports.getEventParticipants = function(eventId) {

  return new models.Events()
    .query({where:{id: eventId}})
    .fetch({withRelated: ['participants'], require: true})
    .then(function(collection) {
      return collection;
    });

};

exports.getParticipant = function(deviceId) {

  return new models.Participant()
    .query({where: {device_id: deviceId}})
    .fetch({require: true})
    .then(function(model) {
      return model;
    });

};

exports.getCheckinStatus = function(deviceId, eventId) {

  var participant_id;

  console.log('deviceId', deviceId, 'eventId', eventId);

  return exports.getParticipant(deviceId)
    .then(function(model) {
      participant_id = model.get('id');
    })
    .then(function() {
      return new models.EventsParticipants()
        .query({where:{participant_id: participant_id, event_id: eventId}})
        .fetch({require: true})
        .then(function(model) {
          return model;
        });
    });

};

exports.getCurrentEvent = function() {

  return new models.Event()
    .query('orderByRaw', 'ABS(UNIX_TIMESTAMP() - UNIX_TIMESTAMP(start_time)) ASC')
    .fetch({require:true})
    .then(function(model) {
      return model;
    });

};

// PUBNUB HELPERS

exports.checkinUser = function(deviceId) {

  var participantId;
  var eventId;
  var eventStartTime;
  var status;
  var now = moment();

  // Get the participant_id from the deviceID
  return exports.getParticipant(deviceId)

    // Get the event_id of the closest event in time
    .then(function(model) {
      participantId = model.get('id');
      return exports.getCurrentEvent();
    })
    .then(function(model) {
      eventId = model.get('id');
      eventStartTime = moment(model.get('start_time'));
      // Update the event_participant status and check-in time
      status = (eventStartTime.format('X') - now.format('X') >= 0) ? 'ontime' : 'late';
      return new models.EventParticipant({event_id: eventId, participant_id: participantId})
        .fetch();
    })
    .then(function(model) {
      if (model && !model.get('status')) {
        // Record exists with a null status, update it
        model.set('status', status);
        model.set('checkin_time', moment().format('YYYY-MM-DD HH:mm:ss'));
        model.save();
      } else if (!model) {
        // Record doesn't exist, create it
        models.EventParticipant.forge({
          event_id: eventId,
          participant_id: participantId,
          status: status,
          checkin_time: now.format('YYYY-MM-DD HH:mm:ss')
        }).save();
      } else {
        // Status is already set, do nothing
        return;
      }
      return {
        deviceId: deviceId,
        eventId: eventId,
        participantId: participantId,
        status: status
      };
    });
};
