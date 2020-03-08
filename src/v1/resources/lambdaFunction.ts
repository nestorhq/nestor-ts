import {
  NestorResourcesLambdaFunction,
  NestorResourcesLambdaFunctionArgs,
  NestorResourcesLambdaFunctionRuntime,
  NestorEnvironmentVariables,
} from '../types';

export interface NestorLambdaFunction {
  model(): NestorResourcesLambdaFunction;
}

export default function mkResourcesLambdaFunction(
  id: string,
  args: NestorResourcesLambdaFunctionArgs,
  variables: NestorEnvironmentVariables,
): NestorLambdaFunction {
  return {
    model(): NestorResourcesLambdaFunction {
      return {
        getId(): string {
          return id;
        },
        getRuntime(): NestorResourcesLambdaFunctionRuntime {
          return args.runtime;
        },
        getFunctionName(): string {
          const name = `${variables.applicationName}-${variables.environmentName}-${args.functionName}`;
          return name;
        },
        getHandlerName(): string {
          return args.handler;
        },
      };
    },
  };
}
