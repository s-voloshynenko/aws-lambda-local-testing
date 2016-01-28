/** Our S3 handler */
var handler = require('../index').handlerS3;

/** Mock event */
var lambdaEvent = require('../lib/lambdaEvent');
var S3Event = new lambdaEvent.S3({ region: 'us-west-2', bucketArn: 'arn:1', 'eventName': 'Test Notification 2222' });

console.dir(S3Event);
console.log(S3Event.trigger(handler))
