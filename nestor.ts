import nestorv1 from './dist/v1';

const nestor = nestorv1('myapp');

console.log('Nestor version:', nestor.getVersion());

const s3Bucket = nestor.resources.s3Bucket('testBucket', {
  bucketName: `${nestor.vars.environmentName}-bucket-1234-abcdef`,
});

const s3BucketDeployments = nestor.resources.s3Bucket('deploymentBucket', {
  bucketName: 'nestor-deployments',
});

nestor.admin.deploymentsStorage({
  bucket: s3BucketDeployments,
  baseDirectory: 'deployments',
});

const dynamoDbMainTable = nestor.resources.dynamoDbMonoTable('testTable', {
  tableName: 'main',
  provisioned: true,
  // rcu: 10,
  // wcu: 10,
});

const lambda = nestor.resources.lambdaFunction('testLambda', {
  runtime: 'NODEJS_12_X',
  handler: 'lambda.handler',
  timeoutInSeconds: 20,
  environment: {
    TABLE_NAME: dynamoDbMainTable.getTableName(),
  },
});
dynamoDbMainTable.grantReadDataToLambda(lambda);

console.log(s3Bucket.getBucketName());

nestor.exec();
