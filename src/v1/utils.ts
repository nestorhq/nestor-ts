import chalk from 'chalk';
import Table from 'cli-table';

import { NestorResources } from './resources';

export function resourcesList(resources: NestorResources): void {
  const log = console.log;
  log(chalk.underline('List of resources:'));
  const repository = resources.resourcesRepository();
  log(chalk.green('S3:'));
  // instantiate
  const table = new Table({
    head: ['#', 'bucket name'],
    colWidths: [5, 100],
  });
  repository.s3Resources.forEach((s3, idx) => {
    table.push([idx, chalk.yellow(s3.getBucketName())]);
  });
  log(table.toString());
}
