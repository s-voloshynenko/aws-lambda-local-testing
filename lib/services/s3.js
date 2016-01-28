var moment = require('moment');
var _ = require('lodash');
var uuid = require('uuid');

/**
 * Initiate AWS S3 bucket event.
 * @param {Object} options - Passed config options.
 * @param {string} options.region - Region of AWS S3 bucket.
 * @param {string} options.eventType - Event type that was defined in AWS S3 bucket 
                                       (Put, Post, Copy, CompleteMultiPartUpload, Delete, DeleteMarkerCreated).
 * @param {string} options.eventName - Event name.
 * @param {string} options.bucketName - Bucket name that "will trigger" current event.
 * @param {string} options.bucketArn - Bucket ARN that "will trigger" current event.
 * @param {string} options.objectName - Name of Uploaded/Deleted/etc. object.
 * @param {string} options.functionName - Name of invoked function.
 */
function initAWSS3(options) {
  var _opt = _.assignIn(this._options, options); // TODO: Get rid of Lodash.
  var invokeID = uuid.v1();

  this.event = {
    Records: [{
      eventVersion: '2.0',
      eventSource: 'aws:s3',
      awsRegion: _opt.region,
      eventTime: moment().format(), // TODO: Investigate how we can format date to this format - '2016-01-28T14:54:49.506Z', without moment.js.
      eventName: _opt.eventType,
      userIdentity: {}, // TODO: Investigate if it will usefull for tests.
      requestParameters: {}, // TODO: Investigate if it will usefull for tests.
      responseElements: {}, // TODO: Investigate if it will usefull for tests.
      s3: {
        s3SchemaVersion: '1.0',
        configurationId: _opt.eventName,
        bucket: {
          name: _opt.bucketName,
          arn: _opt.bucketArn
        },
        object: {
          key: _opt.objectName
        }
      }
    }]
  };

  this.context = {
    awsRequestId: invokeID, // TODO: Investigate what the difference with invokeid.
    invokeid: invokeID,
    logGroupName: '/aws/lambda/' + _opt.functionName,
    functionName: _opt.functionName,
    memoryLimitInMB: _opt.memoryLimitInMB, // TODO: Investigate how to define used memory with invocation.
    functionVersion: '$LATEST', // TODO: Investigate how to recognize function versions.
    invokedFunctionArn: _opt.invokedFunctionArn,
    getRemainingTimeInMillis: function() {}, // TODO: Investigate how to return remaining time.
    succeed: function(data) { return data; },
    fail: function(error) { return error; }, // TODO: Substring error message[1].
    done: function(error, data) {} // TODO: Handle error and data.
  };
}

/** [1]
 * Note
 * For the error from context.fail(error) and context.done(error, null),
 * Lambda will log the first 256 KB of the error object. AWS Lambda will
 * truncate larger error objects when it logs the error, you will see
 * the text "- Truncated by Lambda" next to their error object.
 */

// TODO: Investigate the most appropriate options (+ add unique identificator for default options).
initAWSS3.prototype._options = {
  region: 'us-west-1',
  eventType: 'Object:Put',
  eventName: 'TestNotification',
  bucketName: 'test',
  bucketArn: 'arn:aws:s3:::*',
  objectName: 'test.js',
  functionName: 'test-lambda',
  memoryLimitInMB: '128',
  invokedFunctionArn: 'arn:aws:lambda:us-west-1:*:function:test-lambda'
};

// TODO: Implement function handler
initAWSS3.prototype.trigger = function(fn) {
  return fn(this.event, this.context);
};

module.exports = initAWSS3;
