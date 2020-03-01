import {
  NestorEnvironmentVariables,
  NestorResourcesManager,
  NestorResourcesS3Args,
  NestorResourcesS3,
} from '../types';
import {
  NestorRuntimeArgs,
  NestorRuntimeExec,
  NestorCliDescription,
} from './index';

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
  console.log(args);
  return {
    vars(): NestorEnvironmentVariables {
      return {
        environmentName: args.cli.programOpts.env as string,
        runtimeContext: 'local',
      };
    },
    resources(): NestorResourcesManager {
      return {
        s3(s3args: NestorResourcesS3Args): NestorResourcesS3 {
          return {
            getBucketName(): string {
              return `bucket name for ${s3args.bucketName}`;
            },
          };
        },
      };
    },
    async exec(): Promise<void> {
      console.log('exec');
    },
  };
};
