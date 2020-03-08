import {
  NestorEnvironmentVariables,
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
} from '../types';
import {
  NestorRuntimeArgs,
  NestorRuntimeExec,
  NestorCliDescription,
} from './index';

import chalk from 'chalk';
import Table from 'cli-table';

import { NestorResources } from '../resources';
import {
  resourcesVisit,
  S3Visitor,
  DynamoDbVisitor,
  LambdaVisitor,
} from '../vistor';
import mkAwsApi from './aws/awsApi';
import awsDeployer from './aws/awsDeployer';

export function getLocalCliOptions(): NestorCliDescription {
  return {
    programOptions: [
      ['-e, --env <environment>', 'environment name', 'local'],
      ['-v, --verbose', 'verbose output', false],
    ],
    commands: [
      {
        action: ['deploy', 'perform deployment'],
        options: [['-r, --recursive', 'deploy recursively', false]], // to be removed - for test only
      },
      {
        action: ['list', 'list deployment information'],
      },
    ],
  };
}

export default (args: NestorRuntimeArgs): NestorRuntimeExec => {
  const environmentName = args.cli.programOpts.env as string;
  const appName = args.envVariables.appName;
  return {
    vars(): NestorEnvironmentVariables {
      return {
        environmentName: environmentName,
        runtimeContext: 'local',
        applicationName: appName,
      };
    },
    async exec(resources: NestorResources): Promise<void> {
      switch (args.cli.actionName) {
        case 'deploy':
          {
            const accessKeyId = args.envVariables.awsAccessKeyId;
            const secretAccessKey = args.envVariables.awsSecretAccessKey;
            const region = args.envVariables.awsRegion;
            const awsApi = mkAwsApi({
              accessKeyId,
              secretAccessKey,
              region,
              sessionToken: undefined,
            });
            await awsDeployer(awsApi, resources, appName, environmentName);
          }
          break;

        case 'list':
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
                    _table.push([
                      idx,
                      chalk.yellow(dynamoDbTable.getTableName()),
                    ]);
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
                  visit(
                    lambda: NestorResourcesLambdaFunction,
                    idx: number,
                  ): void {
                    _table.push([idx, chalk.yellow(lambda.getFunctionName())]);
                  },
                  after(): void {
                    log(_table.toString());
                  },
                };
              },
            };
          });
          break;

        default:
          console.log(`unknown command: ${args.cli.actionName}`);
          process.exit(2);
          break;
      }
    },
  };
};
