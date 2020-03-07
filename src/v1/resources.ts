import {
  NestorResourcesAPI,
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesLambdaFunctionArgs,
  NestorResourcesLambdaFunctionRuntime,
  NestorResourcesApiGateway,
} from './types';

export interface ResourcesRepository {
  s3Buckets: NestorResourcesS3Bucket[];
  dynamoDbTables: NestorResourcesDynamodbTable[];
  lambdas: NestorResourcesLambdaFunction[];
  apiGateways: NestorResourcesApiGateway[];
}

function mkResourcesApiGateway(id: string): NestorResourcesApiGateway {
  return {
    getId(): string {
      return id;
    },
    addLambdaJsonIntegration(
      _lambda: NestorResourcesLambdaFunction,
      _resources: string[],
    ): void {
      // TODO
    },
  };
}

function mkResourcesLambdaFunction(
  id: string,
  args: NestorResourcesLambdaFunctionArgs,
): NestorResourcesLambdaFunction {
  return {
    getId(): string {
      return id;
    },
    getRuntime(): NestorResourcesLambdaFunctionRuntime {
      return args.runtime;
    },
  };
}

function mkResourcesS3Bucket(
  id: string,
  args: NestorResourcesS3BucketArgs,
): NestorResourcesS3Bucket {
  return {
    getId(): string {
      return id;
    },
    getBucketName(): string {
      return args.bucketName;
    },
  };
}

function mkResourcesDynamodbTable(
  id: string,
  args: NestorResourcesDynamoDbMonoTableArgs,
): NestorResourcesDynamodbTable {
  return {
    getId(): string {
      return id;
    },
    getTableName(): string {
      return args.tableName;
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
): NestorResourcesAPI {
  return {
    s3Bucket(
      id: string,
      args: NestorResourcesS3BucketArgs,
    ): NestorResourcesS3Bucket {
      const res = mkResourcesS3Bucket(id, args);
      repository.s3Buckets.push(res);
      return res;
    },
    dynamoDbMonoTable(
      id: string,
      args: NestorResourcesDynamoDbMonoTableArgs,
    ): NestorResourcesDynamodbTable {
      const res = mkResourcesDynamodbTable(id, args);
      repository.dynamoDbTables.push(res);
      return res;
    },
    lambdaFunction(
      id: string,
      args: NestorResourcesLambdaFunctionArgs,
    ): NestorResourcesLambdaFunction {
      const res = mkResourcesLambdaFunction(id, args);
      repository.lambdas.push(res);
      return res;
    },
    apiGateway(id: string): NestorResourcesApiGateway {
      const res = mkResourcesApiGateway(id);
      repository.apiGateways.push(res);
      return res;
    },
  };
}

export interface NestorResources {
  resourcesAPI(): NestorResourcesAPI;
  resourcesRepository(): ResourcesRepository;
}

export default (): NestorResources => {
  const repository: ResourcesRepository = {
    s3Buckets: [],
    dynamoDbTables: [],
    lambdas: [],
    apiGateways: [],
  };
  return {
    resourcesAPI(): NestorResourcesAPI {
      return mkResourcesManager(repository);
    },
    resourcesRepository(): ResourcesRepository {
      return repository;
    },
  };
};
