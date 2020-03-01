import program, { Command } from 'commander';

import { NestorEnvironmentVariables, NestorResourcesManager } from '../types';

import mkLocalRuntimeContext, { getLocalCliOptions } from './local';

export interface ProcessEnv {
  [key: string]: string | undefined;
}

export type NestorVariables = { [key: string]: string | boolean | number };

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
  programOpts: NestorVariables;
  actionName: string;
  actionOpts: NestorVariables;
}

export interface NestorRuntimeExec {
  vars(): NestorEnvironmentVariables;
  resources(): NestorResourcesManager;
  exec(): Promise<void>;
}

export interface NestorRuntimeArgs {
  envVariables: NestorVariables;
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

export default function mkRuntimeContext(
  env: ProcessEnv,
  argv: string[],
  version: string,
): NestorRuntimeExec {
  // TODO: parse environment variables to detect which runtime to use
  const cliOptions = getLocalCliOptions();

  const cliArguments = parseCli(cliOptions, argv, version);

  const envVariables: NestorVariables = {};

  const runtimeContext = mkLocalRuntimeContext({
    envVariables,
    cli: cliArguments,
  });

  return runtimeContext;
}
