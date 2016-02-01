/**
 * Available events for services:
 * S3 - expects for region, eventType, eventName, bucketName, bucketArn, objectName (for add. info see required service).
 */

module.exports = {
  S3: require('./services/s3'),
  APIGateway: require('./services/apiGateway')
};
