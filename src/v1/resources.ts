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
} from './types';

export interface ResourcesRepository {
  s3Buckets: NestorResourcesS3Bucket[];
  dynamoDbTables: NestorResourcesDynamodbTable[];
  lambdas: NestorResourcesLambdaFunction[];
  httpApis: NestorResourcesHttpApi[];
}

function mkResourcesHttpApi(
  id: string,
  args: NestorResourcesHttpApiArgs,
  _variables: NestorEnvironmentVariables,
): NestorResourcesHttpApi {
  return {
    getId(): string {
      return id;
    },
    isPublic(): boolean {
      return args.isPublic || false;
    },
    getApiName(): string {
      return args.apiName;
    },
  };
}

function mkResourcesLambdaFunction(
  id: string,
  args: NestorResourcesLambdaFunctionArgs,
  variables: NestorEnvironmentVariables,
): NestorResourcesLambdaFunction {
  return {
    getId(): string {
      return id;
    },
    getRuntime(): NestorResourcesLambdaFunctionRuntime {
      return args.runtime;
    },
    getFunctionName(): string {
      const name = `${variables.applicationName}-${variables.environmentName}-${args.functionName}`;
      return name;
    },
    getHandlerName(): string {
      return args.handler;
    },
  };
}

function mkResourcesS3Bucket(
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

function mkResourcesDynamodbTable(
  id: string,
  args: NestorResourcesDynamoDbMonoTableArgs,
  variables: NestorEnvironmentVariables,
): NestorResourcesDynamodbTable {
  return {
    getId(): string {
      return id;
    },
    getTableName(): string {
      const name = `${variables.applicationName}-${variables.environmentName}-${args.tableName}`;
      return name;
    },
    getArn(): string {
      return 'not_available_yet';
    },
    isMonoTable(): boolean {
      return true;
    },
    grantReadDataToLambda(_lambda: NestorResourcesLambdaFunction): void {
      // TODO
    },
  };
}

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
      return res;
    },
    dynamoDbMonoTable(
      id: string,
      args: NestorResourcesDynamoDbMonoTableArgs,
    ): NestorResourcesDynamodbTable {
      const res = mkResourcesDynamodbTable(id, args, variables);
      repository.dynamoDbTables.push(res);
      return res;
    },
    lambdaFunction(
      id: string,
      args: NestorResourcesLambdaFunctionArgs,
    ): NestorResourcesLambdaFunction {
      const res = mkResourcesLambdaFunction(id, args, variables);
      repository.lambdas.push(res);
      return res;
    },
    httpApi(
      id: string,
      args: NestorResourcesHttpApiArgs,
    ): NestorResourcesHttpApi {
      const res = mkResourcesHttpApi(id, args, variables);
      repository.httpApis.push(res);
      return res;
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
