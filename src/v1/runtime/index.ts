import program, { Command } from 'commander';

import { NestorEnvironmentVariables } from '../types';

import mkLocalRuntimeContext, { getLocalCliOptions } from './local';
import { NestorResources } from '../resources';

export interface ProcessEnv {
  [key: string]: string | undefined;
}

export type NestorEnvVariables = { [key: string]: string };
export type NestorCliVariables = { [key: string]: string | boolean | number };

type NestorOptionDescription = [
  /* flags */ string,
  /* description */ string,
  /* defaultValue */ boolean | string | number,
];

export interface NestorCliDescription {
  programOptions?: NestorOptionDescription[];
  commands: {
    action: [/* nameAndArgs */ string, /* description */ string];
    options?: NestorOptionDescription[];
  }[];
}

export interface NestorCliArguments {
  programOpts: NestorCliVariables;
  actionName: string;
  actionOpts: NestorCliVariables;
}

export interface NestorRuntimeExec {
  vars(): NestorEnvironmentVariables;
  exec(resources: NestorResources): Promise<void>;
}

export interface NestorRuntimeArgs {
  envVariables: NestorEnvVariables;
  cli: NestorCliArguments;
}

function displayHelpAndExit(program: Command, message?: string): never {
  if (message) {
    console.log(message);
    console.log('');
  }
  program.outputHelp();
  process.exit(1);
}

function parseCli(
  cliDescription: NestorCliDescription,
  argv: string[],
  version: string,
): NestorCliArguments {
  const parseResult: NestorCliArguments = {
    actionName: '',
    actionOpts: {},
    programOpts: {},
  };
  // prepare CLI
  program.storeOptionsAsProperties(false).passCommandToAction(false);
  program.version(version);

  if (cliDescription.programOptions) {
    cliDescription.programOptions.forEach(opt => {
      const [flags, description, defaultValue] = opt;
      program.option(flags, description, defaultValue);
    });
  }
  cliDescription.commands.forEach(command => {
    const [nameAndArgs, description] = command.action;
    const actionName = nameAndArgs.split(' ')[0].trim();
    const programCommand = program
      .command(nameAndArgs)
      .description(description);
    if (command.options) {
      command.options.forEach(opt => {
        const [flags, description, defaultValue] = opt;
        programCommand.option(flags, description, defaultValue);
      });
    }
    programCommand.action(options => {
      if (parseResult.actionName !== '') {
        displayHelpAndExit(program, 'only one command allowed');
      }
      Object.keys(options).forEach(
        k => (parseResult.actionOpts[k] = options[k]),
      );
      parseResult.actionName = actionName;
    });
  });

  program.parse(argv);

  if (parseResult.actionName === '') {
    displayHelpAndExit(program, 'missing command');
  }

  if (program.args.length > 0) {
    displayHelpAndExit(program, 'no extra parameters allowed');
  }

  const programOptions = program.opts();
  Object.keys(programOptions).forEach(
    k => (parseResult.programOpts[k] = programOptions[k]),
  );

  return parseResult;
}

function checkEnvVariable(env: ProcessEnv, varName: string): string {
  if (!env[varName]) {
    console.log(`Missing environment varibale: ${varName}`);
    process.exit(2);
  }
  return `${env[varName]}`;
}

export default function mkRuntimeContext(
  env: ProcessEnv,
  argv: string[],
  version: string,
): NestorRuntimeExec {
  // TODO: parse environment variables to detect which runtime to use
  const cliOptions = getLocalCliOptions();

  const cliArguments = parseCli(cliOptions, argv, version);

  // Retrieve AWS environment variables
  const envVariables: NestorEnvVariables = {
    awsAccessKeyId: checkEnvVariable(env, 'NESTOR_AWS_ACCESS_KEY_ID'),
    awsSecretAccessKey: checkEnvVariable(env, 'NESTOR_AWS_SECRET_ACCESS_KEY'),
    awsRegion: checkEnvVariable(env, 'NESTOR_AWS_REGION'),
  };

  const runtimeContext = mkLocalRuntimeContext({
    envVariables,
    cli: cliArguments,
  });

  return runtimeContext;
}
