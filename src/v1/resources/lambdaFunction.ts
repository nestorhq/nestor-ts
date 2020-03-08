import {
  NestorResourcesLambdaFunction,
  NestorResourcesLambdaFunctionArgs,
  NestorResourcesLambdaFunctionRuntime,
  NestorEnvironmentVariables,
} from '../types';

import { ResourcesMapper } from './index';

export interface NestorLambdaFunction {
  setArn(arn: string | undefined): void;
  model(): NestorResourcesLambdaFunction;
}

export default function mkResourcesLambdaFunction(
  id: string,
  args: NestorResourcesLambdaFunctionArgs,
  variables: NestorEnvironmentVariables,
  _mapper: ResourcesMapper,
): NestorLambdaFunction {
  const extra = {
    arn: '',
  };
  return {
    setArn(arn: string | undefined): void {
      extra.arn = arn || '';
    },
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
