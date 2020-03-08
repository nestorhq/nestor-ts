import {
  NestorResourcesAPI,
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesLambdaFunctionArgs,
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
} from '../types';

export interface ResourcesRepository {
  s3Buckets: NestorS3Bucket[];
  dynamoDbTables: NestorDynamodbTable[];
  lambdas: NestorLambdaFunction[];
  httpApis: NestorHttpApi[];
}

import mkResourcesS3Bucket, { NestorS3Bucket } from './s3Bucket';
import mkResourcesHttpApi, { NestorHttpApi } from './httpApi';
import mkResourcesLambdaFunction, {
  NestorLambdaFunction,
} from './lambdaFunction';
import mkResourcesDynamodbTable, { NestorDynamodbTable } from './dynamoDbTable';

function mkResourcesManager(
  repository: ResourcesRepository,
  variables: NestorEnvironmentVariables,
): NestorResourcesAPI {
  return {
    s3Bucket(
      id: string,
      args: NestorResourcesS3BucketArgs,
    ): NestorResourcesS3Bucket {
      const res = mkResourcesS3Bucket(id, args, variables);
      repository.s3Buckets.push(res);
      return res.model();
    },
    dynamoDbMonoTable(
      id: string,
      args: NestorResourcesDynamoDbMonoTableArgs,
    ): NestorResourcesDynamodbTable {
      const res = mkResourcesDynamodbTable(id, args, variables);
      repository.dynamoDbTables.push(res);
      return res.model();
    },
    lambdaFunction(
      id: string,
      args: NestorResourcesLambdaFunctionArgs,
    ): NestorResourcesLambdaFunction {
      const res = mkResourcesLambdaFunction(id, args, variables);
      repository.lambdas.push(res);
      return res.model();
    },
    httpApi(
      id: string,
      args: NestorResourcesHttpApiArgs,
    ): NestorResourcesHttpApi {
      const res = mkResourcesHttpApi(id, args, variables);
      repository.httpApis.push(res);
      return res.model();
    },
  };
}

export interface NestorResources {
  resourcesAPI(): NestorResourcesAPI;
  resourcesRepository(): ResourcesRepository;
}

export default (variables: NestorEnvironmentVariables): NestorResources => {
  const repository: ResourcesRepository = {
    s3Buckets: [],
    dynamoDbTables: [],
    lambdas: [],
    httpApis: [],
  };
  return {
    resourcesAPI(): NestorResourcesAPI {
      return mkResourcesManager(repository, variables);
    },
    resourcesRepository(): ResourcesRepository {
      return repository;
    },
  };
};
