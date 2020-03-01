export interface NestorEnvironmentVariables {
  runtimeContext: 'local' | 'ghaction';
  environmentName: string; // name of the runtime environment production, staging, name of branch ...
}

export interface NestorResourcesS3 {
  getBucketName(): string;
}

export interface NestorResourcesS3Args {
  bucketName: string;
}

export interface NestorResourcesManager {
  s3(args: NestorResourcesS3Args): NestorResourcesS3;
}

export interface NestorAPI {
  getVersion(): string;
  vars: NestorEnvironmentVariables;
  resources: NestorResourcesManager;
  exec(): Promise<void>;
}
