import { NestorEnvironmentVariables } from '../types';
import {
  NestorRuntimeArgs,
  NestorRuntimeExec,
  NestorCliDescription,
} from './index';

import { NestorResources } from '../resources';
import { NestorAdmin } from '../admin';
import mkAwsApi from '../aws/awsApi';
import awsDeployer from '../aws/awsDeployer';
import { listResources } from './common';

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
    async exec(resources: NestorResources, _admin: NestorAdmin): Promise<void> {
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
          listResources(resources);
          break;

        default:
          console.log(`unknown command: ${args.cli.actionName}`);
          process.exit(2);
          break;
      }
    },
  };
};
