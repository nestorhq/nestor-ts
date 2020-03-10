import {
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
} from '../types';

import { ResourcesMapper } from './index';
import { NestorLambdaFunction } from './lambdaFunction';

export interface NestorHttpApi {
  model: NestorResourcesHttpApi;
  setApiId(apiId: string): void;
  setApiEndPoint(apiEndpoint: string): void;
  getApiId(): string;
  getApiEndPoint(): string;

  getTargetLambda(): NestorLambdaFunction;
}

export default function mkResourcesHttpApi(
  id: string,
  args: NestorResourcesHttpApiArgs,
  _variables: NestorEnvironmentVariables,
  _mapper: ResourcesMapper,
): NestorHttpApi {
  const extra = {
    apiId: '',
    apiEndpoint: '',
  };

  return {
    getTargetLambda(): NestorLambdaFunction {
      return _mapper.lambdaFunction(args.targetLambda);
    },
    setApiId(apiId: string): void {
      extra.apiId = apiId;
    },
    getApiId(): string {
      return extra.apiId;
    },
    setApiEndPoint(apiEndpoint: string): void {
      extra.apiEndpoint = apiEndpoint;
    },
    getApiEndPoint(): string {
      return extra.apiEndpoint;
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
