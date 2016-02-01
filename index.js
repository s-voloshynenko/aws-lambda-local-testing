var AWS = require('aws-sdk');
var userService = require('./lib/services/user');

/**
 * AWS S3
 * Collect base info of uploaded/removed file.
 * It will return something like this:
 * { type: 'Put', fileName: 'test.json', bucketName: 'CoolBucket', time: '2016-02-01T16:35:12+02:00' }
 * Where returns? Nowhere :)
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
  userService.getMockUser(event, function(err, user) {
    if (err) return context.fail(err);

    context.succeed(user);
  });
};

/**
 * AWS DynamoDB
 * Log list of users to CloudWatch
 * It will log something like this:
 * { type: 'INSERT', row: '{ "id": 1, "name": "Sergey", "age": 22, "type": "dev" }' }
 */
exports.handlerDynamoDB = function(event, context) {
  
};

/** SNS, Kinesis, Cognito, CloudWatch, CloudFormation in progress.. */
