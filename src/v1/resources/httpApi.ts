import {
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
  NestorResourcesLambdaFunction,
} from '../types';

import { ResourcesMapper } from './index';

export interface NestorHttpApi {
  model(): NestorResourcesHttpApi;
  getTargetLambda(): NestorResourcesLambdaFunction;
}

export default function mkResourcesHttpApi(
  id: string,
  args: NestorResourcesHttpApiArgs,
  _variables: NestorEnvironmentVariables,
  _mapper: ResourcesMapper,
): NestorHttpApi {
  return {
    getTargetLambda(): NestorResourcesLambdaFunction {
      return args.targetLambda;
    },
    model(): NestorResourcesHttpApi {
      return {
        getId(): string {
          return id;
        },
        isPublic(): boolean {
          return args.isPublic || false;
        },
        getApiName(): string {
          return args.apiName;
        },
      };
    },
  };
}
