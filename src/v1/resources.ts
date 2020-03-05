import {
  NestorResourcesAPI,
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
} from './types';

export interface ResourcesRepository {
  s3Buckets: NestorResourcesS3Bucket[];
  dynamoDbTables: NestorResourcesDynamodbTable[];
}

function mkResourcesS3Bucket(
  args: NestorResourcesS3BucketArgs,
): NestorResourcesS3Bucket {
  return {
    getBucketName(): string {
      return args.bucketName;
    },
  };
}

function mkResourcesDynamodbTable(
  args: NestorResourcesDynamoDbMonoTableArgs,
): NestorResourcesDynamodbTable {
  return {
    getTableName(): string {
      return args.tableName;
    },
    getArn(): string {
      return 'not_available_yet';
    },
    isMonoTable(): boolean {
      return true;
    },
  };
}

function mkResourcesManager(
  repository: ResourcesRepository,
): NestorResourcesAPI {
  return {
    s3Bucket(args: NestorResourcesS3BucketArgs): NestorResourcesS3Bucket {
      const res = mkResourcesS3Bucket(args);
      repository.s3Buckets.push(res);
      return res;
    },
    dynamoDbMonoTable(
      args: NestorResourcesDynamoDbMonoTableArgs,
    ): NestorResourcesDynamodbTable {
      const res = mkResourcesDynamodbTable(args);
      repository.dynamoDbTables.push(res);
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
