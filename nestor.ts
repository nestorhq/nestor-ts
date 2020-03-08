import nestorv1 from './dist/v1';

const nestor = nestorv1('myapp');

console.log('Nestor version:', nestor.getVersion());

const s3Bucket = nestor.resources.s3Bucket('testBucket', {
  bucketName: `${nestor.variables.environmentName}-bucket-1234-abcdef`,
});

nestor.admin.deploymentsStorage({
  bucketName: 'nestor-deployments',
  baseDirectory: 'deployments',
});

const dynamoDbMainTable = nestor.resources.dynamoDbMonoTable('testTable', {
  tableName: 'main',
  provisioned: true,
  // rcu: 10,
  // wcu: 10,
});

const lambda = nestor.resources.lambdaFunction('testLambda', {
  functionName: 'myLambda',
  runtime: 'NODEJS_12_X',
  handler: 'lambda.handler',
  timeoutInSeconds: 20,
  environment: {
    TABLE_NAME: dynamoDbMainTable.getTableName(),
  },
});
dynamoDbMainTable.grantReadDataToLambda(lambda);

const apigw = nestor.resources.apiGateway('myApiGateway');
apigw.addLambdaJsonIntegration(lambda, [
  'GET|POST /items',
  'GET|DELETE /items/{item}',
]);

console.log(s3Bucket.getBucketName());

nestor.exec();
