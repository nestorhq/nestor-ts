export interface NestorEnvironmentVariables {
  runtimeContext: 'local' | 'ghaction';
  environmentName: string; // name of the runtime environment production, staging, name of branch ...
}

export interface NestorResourcesS3Bucket {
  getBucketName(): string;
}

export interface NestorResourcesS3BucketArgs {
  bucketName: string;
}

export interface NestorResourcesDynamoDbMonoTableArgs {
  tableName: string;
  provisioned: boolean;
  rcu?: number;
  wcu?: number;
}
export interface NestorResourcesDynamodbTable {
  getTableName(): string;
  getArn(): string;
  isMonoTable(): boolean;
}

export interface NestorResourcesAPI {
  s3Bucket(args: NestorResourcesS3BucketArgs): NestorResourcesS3Bucket;
  dynamoDbMonoTable(
    args: NestorResourcesDynamoDbMonoTableArgs,
  ): NestorResourcesDynamodbTable;
}

export interface NestorDeploymentsStorageArgs {
  bucket: NestorResourcesS3Bucket;
  baseDirectory: string;
}

export interface NestorAdminAPI {
  deploymentsStorage(args: NestorDeploymentsStorageArgs): void;
}

export interface NestorAPI {
  getVersion(): string;
  vars: NestorEnvironmentVariables;
  resources: NestorResourcesAPI;
  admin: NestorAdminAPI;
  exec(): Promise<void>;
}
