export interface NestorEnvironmentVariables {
  runtimeContext: 'local' | 'ghaction';
  applicationName: string; // name of the application
  environmentName: string; // name of the runtime environment production, staging, name of branch ...
}

// HttpApi
export interface NestorResourcesHttpApiArgs {
  apiName: string;
  targetLambda: NestorResourcesLambdaFunction;
}

export interface NestorResourcesHttpApi {
  getId(): string;
}
// end HttpApi

// LambdaFunction
export type NestorResourcesLambdaFunctionRuntime =
  | 'NODEJS_10_X'
  | 'NODEJS_12_X';
export interface NestorResourcesLambdaFunctionArgs {
  functionName: string;
  runtime: NestorResourcesLambdaFunctionRuntime;
  handler: string;
  timeoutInSeconds: number;
  environment: Record<string, string>;
}

export interface NestorResourcesLambdaFunction {
  getId(): string;
  getRuntime(): NestorResourcesLambdaFunctionRuntime;
  getFunctionName(): string;
  getHandlerName(): string;
}
// end LambdaFunction

// s3
export interface NestorResourcesS3Bucket {
  getId(): string;
  getBucketName(): string;
}

export interface NestorResourcesS3BucketArgs {
  bucketName: string;
}
// end s3

// Dynamodb
export interface NestorResourcesDynamoDbMonoTableArgs {
  tableName: string;
  provisioned: boolean;
  rcu?: number;
  wcu?: number;
}

export interface NestorResourcesDynamodbTable {
  getId(): string;
  getTableName(): string;
  getArn(): string;
  isMonoTable(): boolean;
  grantReadDataToLambda(lambda: NestorResourcesLambdaFunction): void;
}
// end Dynamodb

export interface NestorResourcesAPI {
  s3Bucket(
    id: string,
    args: NestorResourcesS3BucketArgs,
  ): NestorResourcesS3Bucket;
  dynamoDbMonoTable(
    id: string,
    args: NestorResourcesDynamoDbMonoTableArgs,
  ): NestorResourcesDynamodbTable;
  lambdaFunction(
    id: string,
    args: NestorResourcesLambdaFunctionArgs,
  ): NestorResourcesLambdaFunction;
  httpApi(id: string, args: NestorResourcesHttpApiArgs): NestorResourcesHttpApi;
}

export interface NestorDeploymentsStorageArgs {
  bucketName: string;
  baseDirectory: string;
}

export interface NestorAdminAPI {
  deploymentsStorage(args: NestorDeploymentsStorageArgs): void;
}

export interface NestorAPI {
  getVersion(): string;
  variables: NestorEnvironmentVariables;
  resources: NestorResourcesAPI;
  admin: NestorAdminAPI;
  exec(): Promise<void>;
}
