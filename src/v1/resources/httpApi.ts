import {
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
  NestorResourcesLambdaFunction,
} from '../types';

import { ResourcesMapper } from './index';
import { NestorLambdaFunction } from './lambdaFunction';

export interface NestorHttpApi {
  model: NestorResourcesHttpApi;
  getTargetLambda(): NestorLambdaFunction;
}

export default function mkResourcesHttpApi(
  id: string,
  args: NestorResourcesHttpApiArgs,
  _variables: NestorEnvironmentVariables,
  _mapper: ResourcesMapper,
): NestorHttpApi {
  return {
    getTargetLambda(): NestorLambdaFunction {
      return _mapper.lambdaFunction(args.targetLambda);
    },
    model: {
      getId(): string {
        return id;
      },
      isPublic(): boolean {
        return args.isPublic || false;
      },
      getApiName(): string {
        return args.apiName;
      },
    },
  };
}
