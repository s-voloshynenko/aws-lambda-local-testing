var _ = require('lodash');
var uuid = require('uuid');

/**
 * Initiate AWS API Gateway bucket event.
 * @param {Object} options - Passed config options.
 * @param {Object} options.template - Mapping Template, that can contain query, body, headers parameters (it specifying in Method Execution).
 * @param {string} options.functionName - Name of invoked function.
 */
function initAPIGateway(options) {
  var self = this;
  var _opt = _.assignIn(this._options, options); // TODO: Get rid of Lodash.
  var invokeID = uuid.v1();

  this.event = _opt.template;

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
}

/** [1]
 * Note
 * For the error from context.fail(error) and context.done(error, null),
 * Lambda will log the first 256 KB of the error object. AWS Lambda will
 * truncate larger error objects when it logs the error, you will see
 * the text "- Truncated by Lambda" next to their error object.
 */

// TODO: Investigate the most appropriate options (+ add unique identificator for default options).
initAPIGateway.prototype._options = {
  template: {},
  functionName: 'test-lambda',
  memoryLimitInMB: '128',
  invokedFunctionArn: 'arn:aws:lambda:us-west-1:*:function:test-lambda'
};

// TODO: Implement function handler
initAPIGateway.prototype.invoke = function(fn) {
  this.startAt = new Date().getTime();
  return fn(this.event, this.context);
};

/** Invocation result. By default - 'Process exited before completing request.' */
initAPIGateway.prototype.invocationResult = 'Process exited before completing request.';

/** Context handlers counters */
initAPIGateway.prototype.succeedCallCount = 0;
initAPIGateway.prototype.failCallCount = 0;
initAPIGateway.prototype.doneCallCount = 0;

/** Function time execution */
initAPIGateway.prototype.startAt = 0;
initAPIGateway.prototype.endAt = 0;

module.exports = initAPIGateway;
