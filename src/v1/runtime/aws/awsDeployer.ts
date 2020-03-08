import { NestorAwsAPI } from './awsApi';

import { NestorResources } from '../../resources';
import mkS3 from './s3';
import mkDynamoDb from './dynamoDb';
import mkLambda from './lambda';
import mkRole from './role';

export default async function deploy(
  awsApi: NestorAwsAPI,
  resources: NestorResources,
  appName: string,
  environmentName: string,
): Promise<void> {
  const repository = resources.resourcesRepository();
  const clientS3 = mkS3(awsApi.s3(), appName, environmentName);
  for (const s3Resource of repository.s3Buckets) {
    const alreadyExists = await clientS3.checkBucketExists(
      s3Resource.getBucketName(),
    );
    if (!alreadyExists) {
      await clientS3.createBucket(s3Resource.getBucketName());
    }
  }
  const clientDynamoDb = mkDynamoDb(
    awsApi.dynamoDb(),
    appName,
    environmentName,
  );
  for (const dynamoDbTableResource of repository.dynamoDbTables) {
    await clientDynamoDb.createMonoTable(dynamoDbTableResource.getTableName());
  }

  const clientLambda = mkLambda(awsApi.lambda(), appName, environmentName);
  const clientRole = mkRole(awsApi.iam(), appName, environmentName);
  for (const lambda of repository.lambdas) {
    const roleInfo = await clientRole.createLambdaRole(
      `role-lambda-${lambda.getId()}`,
      lambda.getFunctionName(),
    );
    await clientLambda.createFunction(
      lambda.getFunctionName(),
      lambda.getHandlerName(),
      roleInfo.arn,
    );
  }
}
