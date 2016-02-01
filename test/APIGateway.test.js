var Lab = require('lab');
var Code = require('code');
var lab = exports.lab = Lab.script();

var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;
var expect = Code.expect;

var handler = require('../index').handlerAPIGateway; // Our API Gateway handler
var lambdaEvent = require('./utils/lambdaEvent'); // Mock event

describe('API Gateway handler',  function() {
  var APIGatewayEvent;

  describe('succeeded result', function() {
    beforeEach(function(done) {
      APIGatewayEvent = new lambdaEvent.APIGateway({ template: { stage: 'prod', id: 1 } });
      APIGatewayEvent.invoke(handler);
      done();
    });

    it('should complete with succeed', function(done) {
      expect(APIGatewayEvent.succeedCallCount).equals(1);
      expect(APIGatewayEvent.failCallCount).equals(0);
      expect(APIGatewayEvent.event.stage).equals('prod');
      expect(APIGatewayEvent.event.id).equals(1);
      expect(APIGatewayEvent.invocationResult.name).to.be.string();
      expect(APIGatewayEvent.invocationResult.name).equals('Sergey');
      expect(APIGatewayEvent.invocationResult.role).equals('dev');
      done();
    });
  });

  describe('failed result', function() {
    beforeEach(function(done) {
      APIGatewayEvent = new lambdaEvent.APIGateway({ template: { stage: 'ci', id: 2 } });
      APIGatewayEvent.invoke(handler);
      done();
    });

    it('should fail', function(done) {
      expect(APIGatewayEvent.succeedCallCount).equals(0);
      expect(APIGatewayEvent.failCallCount).equals(1);
      expect(APIGatewayEvent.event.stage).equals('ci');
      expect(APIGatewayEvent.event.id).equals(2);
      expect(APIGatewayEvent.invocationResult.error).to.be.string();
      expect(APIGatewayEvent.invocationResult.error).equals('Current user doesn\'t exist.');
      done();
    });
  });
});
