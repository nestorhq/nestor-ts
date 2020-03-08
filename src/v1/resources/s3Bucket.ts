import {
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorEnvironmentVariables,
} from '../types';

export interface NestorS3Bucket {
  model(): NestorResourcesS3Bucket;
}

export default function mkResourcesS3Bucket(
  id: string,
  args: NestorResourcesS3BucketArgs,
  variables: NestorEnvironmentVariables,
): NestorS3Bucket {
  return {
    model(): NestorResourcesS3Bucket {
      return {
        getId(): string {
          return id;
        },
        getBucketName(): string {
          const name = `${variables.applicationName}-${variables.environmentName}-${args.bucketName}`;
          return name;
        },
      };
    },
  };
}
