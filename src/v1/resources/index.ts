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

const resourcesMap = new Map();

export interface ResourcesMapper {
  httpApi(model: NestorResourcesHttpApi): NestorHttpApi;
  lambdaFunction(model: NestorResourcesLambdaFunction): NestorLambdaFunction;
}

const mapper: ResourcesMapper = {
  httpApi(model: NestorResourcesHttpApi): NestorHttpApi {
    const res = resourcesMap.get(model);
    if (!res) {
      throw new Error(`no instance of NestorHttpApi found`);
    }
    return res as NestorHttpApi;
  },
  lambdaFunction(model: NestorResourcesLambdaFunction): NestorLambdaFunction {
    const res = resourcesMap.get(model);
    if (!res) {
      throw new Error(`no instance of NestorLambdaFunction found`);
    }
    return res as NestorLambdaFunction;
  },
};

function mkResourcesManager(
  repository: ResourcesRepository,
  variables: NestorEnvironmentVariables,
): NestorResourcesAPI {
  return {
    s3Bucket(
      id: string,
      args: NestorResourcesS3BucketArgs,
    ): NestorResourcesS3Bucket {
      const res = mkResourcesS3Bucket(id, args, variables, mapper);
      repository.s3Buckets.push(res);
      const model = res.model;
      resourcesMap.set(model, res);
      return model;
    },
    dynamoDbMonoTable(
      id: string,
      args: NestorResourcesDynamoDbMonoTableArgs,
    ): NestorResourcesDynamodbTable {
      const res = mkResourcesDynamodbTable(id, args, variables, mapper);
      repository.dynamoDbTables.push(res);
      const model = res.model;
      resourcesMap.set(model, res);
      return model;
    },
    lambdaFunction(
      id: string,
      args: NestorResourcesLambdaFunctionArgs,
    ): NestorResourcesLambdaFunction {
      const res = mkResourcesLambdaFunction(id, args, variables, mapper);
      repository.lambdas.push(res);
      const model = res.model;
      resourcesMap.set(model, res);
      return model;
    },
    httpApi(
      id: string,
      args: NestorResourcesHttpApiArgs,
    ): NestorResourcesHttpApi {
      const res = mkResourcesHttpApi(id, args, variables, mapper);
      repository.httpApis.push(res);
      const model = res.model;
      resourcesMap.set(model, res);
      return model;
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
