var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var expect = Code.expect;

var handler = require('../index').handlerS3; // Our S3 handler
var lambdaEvent = require('../lib/lambdaEvent'); // Mock event

describe('S3 Bucket handler',  function() {
  var S3Event;

  beforeEach(function(done) {
    S3Event = new lambdaEvent.S3({ region: 'us-west-2', objectName: 'test.json', eventType: 'Object:Put' });
    S3Event.invoke(handler);
    done();
  });

  it('should complete with succeed', function(done) {
    expect(S3Event.succeedCallCount).equals(1);
    expect(S3Event.invocationResult).to.be.an.array();
    expect(S3Event.invocationResult).to.have.length(1);
    expect(S3Event.invocationResult[0].fileName).equals('test.json');
    expect(S3Event.invocationResult[0].type).equals('Put');
    done();
  });
});
