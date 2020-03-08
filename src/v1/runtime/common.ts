import chalk from 'chalk';
import Table from 'cli-table';

import {
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
} from '../types';

import {
  resourcesVisit,
  S3Visitor,
  DynamoDbVisitor,
  LambdaVisitor,
} from '../utils/visitor';

import { NestorResources } from '../resources';

export function listResources(resources: NestorResources): void {
  resourcesVisit(resources, () => {
    const log = console.log;
    return {
      before(): void {
        log(chalk.underline('List of resources:'));
      },
      after(): void {
        log('');
      },
      s3(): S3Visitor {
        const _table = new Table({
          head: ['#', 'bucket name'],
          colWidths: [5, 100],
        });

        return {
          before(): void {
            log('');
            log(chalk.green('S3 buckets:'));
          },
          visit(s3: NestorResourcesS3Bucket, idx: number): void {
            _table.push([idx, chalk.yellow(s3.getBucketName())]);
          },
          after(): void {
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
          before(): void {
            log('');
            log(chalk.green('DynamoDb tables:'));
          },
          visit(
            dynamoDbTable: NestorResourcesDynamodbTable,
            idx: number,
          ): void {
            _table.push([idx, chalk.yellow(dynamoDbTable.getTableName())]);
          },
          after(): void {
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
          before(): void {
            log('');
            log(chalk.green('Lambda functionbs:'));
          },
          visit(lambda: NestorResourcesLambdaFunction, idx: number): void {
            _table.push([idx, chalk.yellow(lambda.getFunctionName())]);
          },
          after(): void {
            log(_table.toString());
          },
        };
      },
    };
  });
}
