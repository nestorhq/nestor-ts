import { NestorAwsAPI } from './awsApi';

import { NestorResources } from '../../resources';
import mkS3 from './s3';
import mkDynamoDb from './dynamoDb';

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
}
