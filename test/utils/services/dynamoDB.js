var moment = require('moment');
var _ = require('lodash');
var uuid = require('uuid');

/**
 * Initiate AWS DynamoDB bucket event.
 * @param {Object} options - Passed config options.
 * @param {Object} options.schema - DynamoDB table schema.
 * @param {string} options.region - Region of AWS S3 bucket.
 * @param {string} options.eventType - Event type that was defined in AWS S3 bucket 
                                       (Put, Post, Copy, CompleteMultiPartUpload, Delete, DeleteMarkerCreated).
 * @param {string} options.eventName - Event name.
 * @param {string} options.functionName - Name of invoked function.
 */
function initAWSDynamoDB(options) {
  var self = this;
  var _opt = _.assignIn(this._options, options); // TODO: Get rid of Lodash.
  var invokeID = uuid.v1();
  var keys;

  try {
    keys = getKeys()
  } catch (err) {
    self.invoke = function() { throw new Error('Provide schema for current DynamoDB table.') };
    return self;
  }

  this.event = {
    Records: [{
      eventID: uuid.v4(),
      eventName: _opt.eventType,
      eventVersion: '1.0',
      eventSource: 'aws:dynamodb',
      awsRegion: _opt.region,
      dynamodb: {
        Keys: keys,
        NewImage: getImage(),
        StreamViewType: 'NEW_AND_OLD_IMAGES' // TODO: ViewType option.
      },
      eventSourceARN: 'test'
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
    getRemainingTimeInMillis: function() { // TODO: Investigate how to return remaining time.
      return self.startAt - self.endAt;
    },
    succeed: function(data) {
      self.endAt = new Date().getTime();
      self.succeedCallCount++;
      self.invocationResult = data;
      return data;
    },
    fail: function(error) { // TODO: Substring error message[1].
      self.endAt = new Date().getTime();
      self.failCallCount++;
      self.invocationResult = { error: error };
      return error;
    },
    done: function(error, data) {} // TODO: Handle error and data.
  };

  /**
   * Get primary key for current schema
   * TODO: Investigate the posibility of adding more than 1 primary key.
   */
  function getKeys() {
    var keyObj = {};
    var keyType = {};

    // TODO: Implement unified parser for schema types.
    switch (options.schema[options.schema.primaryKey].toLowerCase()) {
      case 'string':
        keyType.S = options.item[options.schema.primaryKey];
        break;
      case 'number':
        keyType.N = options.item[options.schema.primaryKey];
        break;
      case 'binary':
        keyType.B = options.item[options.schema.primaryKey];
        break;
      default:
        keyType.S = options.item[options.schema.primaryKey];
    }

    keyObj[options.schema.primaryKey] = keyType;

    return keyObj;
  }

  function getImage() {
    var imageObj = {};

    for (var key in options.item) {
      var type = {};

      // TODO: Implement unified parser for schema types.
      switch (options.schema[key].toLowerCase()) {
        case 'string':
          type.S = options.item[key];
          break;
        case 'number':
          type.N = options.item[key];
          break;
        case 'binary':
          type.B = options.item[key];
          break;
        default:
          type.S = options.item[key];
      }

      imageObj[key] = type;
    }

    return imageObj;
  }
}

/** [1]
 * Note
 * For the error from context.fail(error) and context.done(error, null),
 * Lambda will log the first 256 KB of the error object. AWS Lambda will
 * truncate larger error objects when it logs the error, you will see
 * the text "- Truncated by Lambda" next to their error object.
 */

// TODO: Investigate the most appropriate options (+ add unique identificator for default options).
initAWSDynamoDB.prototype._options = {
  region: 'us-west-1',
  eventType: 'INSERT',
  functionName: 'test-lambda',
  memoryLimitInMB: '128',
  invokedFunctionArn: 'arn:aws:lambda:us-west-1:*:function:test-lambda'
};

// TODO: Implement function handler
initAWSDynamoDB.prototype.invoke = function(fn) {
  this.startAt = new Date().getTime();
  return fn(this.event, this.context);
};

/** Invocation result. By default - 'Process exited before completing request.' */
initAWSDynamoDB.prototype.invocationResult = 'Process exited before completing request.';

/** Context handlers counters */
initAWSDynamoDB.prototype.succeedCallCount = 0;
initAWSDynamoDB.prototype.failCallCount = 0;
initAWSDynamoDB.prototype.doneCallCount = 0;

/** Function time execution */
initAWSDynamoDB.prototype.startAt = 0;
initAWSDynamoDB.prototype.endAt = 0;

module.exports = initAWSDynamoDB;
