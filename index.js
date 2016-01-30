/**
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

/** DynamoDB, API Gateway, etc. in progress.. */
