import { NestorAwsAPI } from './awsApi';

import { NestorResources } from '../../resources';
import mkS3 from './s3';

export default async function deploy(
  awsApi: NestorAwsAPI,
  resources: NestorResources,
  appName: string,
  environmentName: string,
): Promise<void> {
  const repository = resources.resourcesRepository();
  const client = mkS3(awsApi.s3(), appName, environmentName);
  for (const s3Resource of repository.s3Resources) {
    const alreadyExists = await client.checkBucketExists(
      s3Resource.getBucketName(),
    );
    if (!alreadyExists) {
      await client.createBucket(s3Resource.getBucketName());
    }
  }
}
