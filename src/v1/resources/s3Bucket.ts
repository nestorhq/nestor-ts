import {
  NestorResourcesAPI,
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesLambdaFunctionArgs,
  NestorResourcesLambdaFunctionRuntime,
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
} from '../types';

export default function mkResourcesS3Bucket(
  id: string,
  args: NestorResourcesS3BucketArgs,
  variables: NestorEnvironmentVariables,
): NestorResourcesS3Bucket {
  return {
    getId(): string {
      return id;
    },
    getBucketName(): string {
      const name = `${variables.applicationName}-${variables.environmentName}-${args.bucketName}`;
      return name;
    },
  };
}
