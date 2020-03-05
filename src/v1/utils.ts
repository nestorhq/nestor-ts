import chalk from 'chalk';
import Table from 'cli-table';

import { NestorResources } from './resources';

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
