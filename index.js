/**
 * AWS S3
 * Collect base info of uploaded/removed file 
 */
exports.handlerS3 = function(event, context) {
  var bucketUpdates = [];

  event.Records.forEach(function(record) {
    var evt = {};
    evt.type = record.eventName.substring(record.eventName.indexOf(':') + 1);
    evt.fileName = record.s3.object.key;
    evt.bucketName = record.s3.bucket.name;
    evt.time = record.eventTime;
    bucketUpdates.push(evt);
  });

  context.succeed(bucketUpdates);
};

/**
 * AWS API Gateway
 * Provide users by ID
 */
exports.handlerAPIGateway = function(event, context) {
  MockUserService(event, function(err, user) {
    if (err) return context.fail(err);

    context.succeed(user);
  });
};

var Users = {
  prod: {
    1: {
      name: 'Sergey',
      role: 'dev'
    },
    2: {
      name: 'Max',
      role: 'dev'
    }
  },
  ci: {
    1: {
      name: 'Alex',
      role: 'PM'
    }
  }
};

function MockUserService(event, cb) {
  if (!Users[event.stage] || !Users[event.stage][event.id]) return cb('Current user doesn\'t exist.');

  cb(null, Users[event.stage][event.id]);
}

/** DynamoDB, etc. in progress.. */
