import fs from 'fs';
import archiver from 'archiver';
import streams from 'memory-streams';

import chalk from 'chalk';
import Table from 'cli-table';

import { NestorResources } from './resources';
import {
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
} from './types';

export function resourcesList(resources: NestorResources): void {
  const log = console.log;
  log(chalk.underline('List of resources:'));
  const repository = resources.resourcesRepository();
  log(chalk.green('S3 buckets:'));
  const tableS3Buckets = new Table({
    head: ['#', 'bucket name'],
    colWidths: [5, 100],
  });
  repository.s3Buckets.forEach((s3, idx) => {
    tableS3Buckets.push([idx, chalk.yellow(s3.getBucketName())]);
  });
  log(tableS3Buckets.toString());

  log(chalk.green('DynamoDb tables:'));
  const tableDynamoDbTables = new Table({
    head: ['#', 'table name'],
    colWidths: [5, 100],
  });
  repository.dynamoDbTables.forEach((table, idx) => {
    tableDynamoDbTables.push([idx, chalk.yellow(table.getTableName())]);
  });
  log(tableDynamoDbTables.toString());
}

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

// https://stackoverflow.com/questions/21491567/how-to-implement-a-writable-stream
// http://derpturkey.com/buffer-to-stream-in-node/
// https://github.com/paulja/memory-streams-js
export async function makeZip(
  content: string,
  fileName: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = new streams.WritableStream();

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log(
        'archiver has been finalized and the output file descriptor has closed.',
      );
      resolve(output.toBuffer());
    });

    output.on('finish', () => {
      // Nothing
      resolve(output.toBuffer());
    });

    output.on('end', function() {
      // console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      reject(err);
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.append(content, { name: fileName });

    archive.finalize();
  });
}

export async function makeZipFromFile(
  inputFile: string,
  fileName: string,
  outputFile: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = outputFile
      ? fs.createWriteStream(outputFile)
      : new streams.WritableStream();

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log(
        'archiver has been finalized and the output file descriptor has closed.',
      );
      return resolve(outputFile);
    });

    output.on('finish', () => {
      // nothing
    });

    output.on('end', function() {
      // console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      reject(err);
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.append(fs.createReadStream(inputFile), { name: fileName });

    archive.finalize();
  });
}

/***
const props = {
  appName: 'MyApp',
  environment: 'production',
  x1: 1,
  s1: 'abc',
};

console.log('props:', props);
[
  'hello',
  '${appName}',
  '${appname}${environment}',
  'x1 is: ${x1} and ${x1}/${s1}! s1${}',
].forEach((test) => {
  console.log(`${test} => ${replaceWithProps(test, props)}`);
});

*/

/*
makeZip('Hello world!', 'index.js')
  .then((result) => {
    console.log('result:');
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
  */
