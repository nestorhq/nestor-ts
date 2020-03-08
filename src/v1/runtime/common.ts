import chalk from 'chalk';
import Table from 'cli-table';

import {
  resourcesVisit,
  ResourcesVisitor,
  S3Visitor,
  DynamoDbVisitor,
  LambdaVisitor,
  HttpApiVisitor,
} from '../utils/visitor';

import { NestorResources } from '../resources';
import { NestorDynamodbTable } from '../resources/dynamoDbTable';
import { NestorHttpApi } from '../resources/httpApi';
import { NestorLambdaFunction } from '../resources/lambdaFunction';
import { NestorS3Bucket } from '../resources/s3Bucket';

export async function listResources(resources: NestorResources): Promise<void> {
  await resourcesVisit(
    resources,
    (): ResourcesVisitor => {
      const log = console.log;
      return {
        async before(): Promise<void> {
          log(chalk.underline('List of resources:'));
        },
        async after(): Promise<void> {
          log('');
        },
        s3(): S3Visitor {
          const _table = new Table({
            head: ['#', 'bucket name'],
            colWidths: [5, 100],
          });

          return {
            async before(): Promise<void> {
              log('');
              log(chalk.green('S3 buckets:'));
            },
            async visit(s3: NestorS3Bucket, idx: number): Promise<void> {
              _table.push([idx, chalk.yellow(s3.model().getBucketName())]);
            },
            async after(): Promise<void> {
              log(_table.toString());
            },
          };
        },
        dynamoDb(): DynamoDbVisitor {
          const _table = new Table({
            head: ['#', 'table name'],
            colWidths: [5, 100],
          });
          return {
            async before(): Promise<void> {
              log('');
              log(chalk.green('DynamoDb tables:'));
            },
            async visit(
              dynamoDbTable: NestorDynamodbTable,
              idx: number,
            ): Promise<void> {
              _table.push([
                idx,
                chalk.yellow(dynamoDbTable.model().getTableName()),
              ]);
            },
            async after(): Promise<void> {
              log(_table.toString());
            },
          };
        },
        lambda(): LambdaVisitor {
          const _table = new Table({
            head: ['#', 'function name'],
            colWidths: [5, 100],
          });
          return {
            async before(): Promise<void> {
              log('');
              log(chalk.green('Lambda functions:'));
            },
            async visit(
              lambda: NestorLambdaFunction,
              idx: number,
            ): Promise<void> {
              _table.push([
                idx,
                chalk.yellow(lambda.model().getFunctionName()),
              ]);
            },
            async after(): Promise<void> {
              log(_table.toString());
            },
          };
        },
        httpApi(): HttpApiVisitor {
          const _table = new Table({
            head: ['#', 'http Api name', 'Public?'],
            colWidths: [5, 90, 10],
          });
          return {
            async before(): Promise<void> {
              log('');
              log(chalk.green('Http Apis:'));
            },
            async visit(httpApi: NestorHttpApi, idx: number): Promise<void> {
              _table.push([
                idx,
                chalk.yellow(httpApi.model().getId()),
                chalk.yellow(httpApi.model().isPublic() ? 'Y' : 'N'),
              ]);
            },
            async after(): Promise<void> {
              log(_table.toString());
            },
          };
        },
      };
    },
  );
}
