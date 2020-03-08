import { NestorResources } from '../resources';
import {
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesHttpApi,
} from '../types';

export interface S3Visitor {
  before(): Promise<void>;
  visit(s3: NestorResourcesS3Bucket, idx: number): Promise<void>;
  after(): Promise<void>;
}

export interface DynamoDbVisitor {
  before(): Promise<void>;
  visit(
    dynamoDbTable: NestorResourcesDynamodbTable,
    idx: number,
  ): Promise<void>;
  after(): Promise<void>;
}

export interface LambdaVisitor {
  before(): Promise<void>;
  visit(lambda: NestorResourcesLambdaFunction, idx: number): Promise<void>;
  after(): Promise<void>;
}

export interface HttpApiVisitor {
  before(): Promise<void>;
  visit(lambda: NestorResourcesHttpApi, idx: number): Promise<void>;
  after(): Promise<void>;
}

export interface ResourcesVisitor {
  before(): Promise<void>;
  s3(): S3Visitor;
  dynamoDb(): DynamoDbVisitor;
  lambda(): LambdaVisitor;
  httpApi(): HttpApiVisitor;
  after(): Promise<void>;
}

interface ResourcesVisitorFactory {
  (): ResourcesVisitor;
}
export async function resourcesVisit(
  resources: NestorResources,
  factory: ResourcesVisitorFactory,
): Promise<void> {
  let idx = 0;
  const visitor = factory();
  await visitor.before();
  const repository = resources.resourcesRepository();

  // S3
  const s3Visitor = visitor.s3();
  await s3Visitor.before();
  idx = 0;
  for (const s3 of repository.s3Buckets) {
    await s3Visitor.visit(s3, idx);
    idx++;
  }
  await s3Visitor.after();

  // DynamoDbTable
  const dynamoDbVisitor = visitor.dynamoDb();
  await dynamoDbVisitor.before();
  idx = 0;
  for (const table of repository.dynamoDbTables) {
    await dynamoDbVisitor.visit(table, idx);
  }
  await dynamoDbVisitor.after();

  // lambda
  const lambdaVisitor = visitor.lambda();
  await lambdaVisitor.before();
  idx = 0;
  for (const lambda of repository.lambdas) {
    await lambdaVisitor.visit(lambda, idx);
  }
  await lambdaVisitor.after();

  // httpApi
  const httpApiVisitor = visitor.httpApi();
  await httpApiVisitor.before();
  idx = 0;
  for (const httpApi of repository.httpApis) {
    await httpApiVisitor.visit(httpApi, idx);
  }
  await httpApiVisitor.after();

  await visitor.after();
}
