import {
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorEnvironmentVariables,
} from '../types';

import { ResourcesMapper } from './index';

export interface NestorS3Bucket {
  model: NestorResourcesS3Bucket;
}

export default function mkResourcesS3Bucket(
  id: string,
  args: NestorResourcesS3BucketArgs,
  variables: NestorEnvironmentVariables,
  _mapper: ResourcesMapper,
): NestorS3Bucket {
  return {
    model: {
      getId(): string {
        return id;
      },
      getBucketName(): string {
        const name = `${variables.applicationName}-${variables.environmentName}-${args.bucketName}`;
        return name;
      },
    },
  };
}
