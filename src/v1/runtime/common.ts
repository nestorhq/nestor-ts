import chalk from 'chalk';
import Table from 'cli-table';

import {
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesHttpApi,
} from '../types';

import {
  resourcesVisit,
  ResourcesVisitor,
  S3Visitor,
  DynamoDbVisitor,
  LambdaVisitor,
  HttpApiVisitor,
} from '../utils/visitor';

import { NestorResources } from '../resources';

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
            async visit(
              s3: NestorResourcesS3Bucket,
              idx: number,
            ): Promise<void> {
              _table.push([idx, chalk.yellow(s3.getBucketName())]);
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
              dynamoDbTable: NestorResourcesDynamodbTable,
              idx: number,
            ): Promise<void> {
              _table.push([idx, chalk.yellow(dynamoDbTable.getTableName())]);
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
              lambda: NestorResourcesLambdaFunction,
              idx: number,
            ): Promise<void> {
              _table.push([idx, chalk.yellow(lambda.getFunctionName())]);
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
            async visit(
              httpApi: NestorResourcesHttpApi,
              idx: number,
            ): Promise<void> {
              _table.push([
                idx,
                chalk.yellow(httpApi.getId()),
                chalk.yellow(httpApi.isPublic() ? 'Y' : 'N'),
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
