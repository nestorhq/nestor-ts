import { NestorEnvironmentVariables } from '../types';
import {
  NestorRuntimeArgs,
  NestorRuntimeExec,
  NestorCliDescription,
} from './index';

import { NestorResources } from '../resources';
import { resourcesList } from '../utils';

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
  return {
    vars(): NestorEnvironmentVariables {
      return {
        environmentName: args.cli.programOpts.env as string,
        runtimeContext: 'local',
      };
    },
    async exec(resources: NestorResources): Promise<void> {
      switch (args.cli.actionName) {
        case 'deploy':
          break;

        case 'list':
          resourcesList(resources);
          break;

        default:
          console.log(`unknown command: ${args.cli.actionName}`);
          process.exit(2);
          break;
      }
    },
  };
};
