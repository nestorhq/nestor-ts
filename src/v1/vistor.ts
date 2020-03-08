import { NestorResources } from './resources';
import {
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
} from './types';

export interface S3Visitor {
  before(): void;
  visit(s3: NestorResourcesS3Bucket, idx: number): void;
  after(): void;
}

export interface DynamoDbVisitor {
  before(): void;
  visit(dynamoDbTable: NestorResourcesDynamodbTable, idx: number): void;
  after(): void;
}

export interface LambdaVisitor {
  before(): void;
  visit(lambda: NestorResourcesLambdaFunction, idx: number): void;
  after(): void;
}

export interface ResourcesVisitor {
  before(): void;
  s3(): S3Visitor;
  dynamoDb(): DynamoDbVisitor;
  lambda(): LambdaVisitor;
  after(): void;
}

interface ResourcesVisitorFactory {
  (): ResourcesVisitor;
}
export function resourcesVisit(
  resources: NestorResources,
  factory: ResourcesVisitorFactory,
): void {
  const visitor = factory();
  visitor.before();
  const repository = resources.resourcesRepository();

  // S3
  const s3Visitor = visitor.s3();
  s3Visitor.before();
  repository.s3Buckets.forEach((s3, idx) => {
    s3Visitor.visit(s3, idx);
  });
  s3Visitor.after();

  // DynamoDbTable
  const dynamoDbVisitor = visitor.dynamoDb();
  dynamoDbVisitor.before();
  repository.dynamoDbTables.forEach((table, idx) => {
    dynamoDbVisitor.visit(table, idx);
  });
  dynamoDbVisitor.after();

  // lambda
  const lambdaVisitor = visitor.lambda();
  lambdaVisitor.before();
  repository.lambdas.forEach((lambda, idx) => {
    lambdaVisitor.visit(lambda, idx);
  });
  lambdaVisitor.after();

  visitor.after();
}
