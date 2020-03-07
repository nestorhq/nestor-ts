export interface NestorEnvironmentVariables {
  runtimeContext: 'local' | 'ghaction';
  environmentName: string; // name of the runtime environment production, staging, name of branch ...
}

// ApiGateway
export interface NestorResourcesApiGateway {
  getId(): string;
  addLambdaJsonIntegration(
    lambda: NestorResourcesLambdaFunction,
    resources: string[],
  ): void;
}
// end ApiGateway

// LambdaFunction
export type NestorResourcesLambdaFunctionRuntime =
  | 'NODEJS_10_X'
  | 'NODEJS_12_X';
export interface NestorResourcesLambdaFunctionArgs {
  runtime: NestorResourcesLambdaFunctionRuntime;
  handler: string;
  timeoutInSeconds: number;
  environment: Record<string, string>;
}

export interface NestorResourcesLambdaFunction {
  getId(): string;
  getRuntime(): NestorResourcesLambdaFunctionRuntime;
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
  apiGateway(id: string): NestorResourcesApiGateway;
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
