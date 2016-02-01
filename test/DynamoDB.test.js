var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var expect = Code.expect;

var handler = require('../index').handlerDynamoDB; // Our DynamoDB handler
var lambdaEvent = require('./utils/lambdaEvent'); // Mock event

describe('DynamoDB handler',  function() {
  var DynamoDBEvent;
  var schema;
  var inputObj;

  beforeEach(function(done) {
    schema = { id: 'NUMBER', name: 'STRING', primaryKey: 'id' };
    inputObj = { id: 55, name: 'test' };
    DynamoDBEvent = new lambdaEvent.DynamoDB({ schema: schema, region: 'us-west-2', objectName: 'test.json', eventType: 'INSERT', item: inputObj });
    DynamoDBEvent.invoke(handler);
    done();
  });

  it('should complete with succeed', function(done) {
    expect(DynamoDBEvent.event.Records[0].dynamodb.NewImage.id.N).equals(5);
    expect(DynamoDBEvent.event.Records[0].dynamodb.NewImage.name.S).equals('test');
    done();
  });
});
