import {
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
} from '../types';

export interface NestorHttpApi {
  model(): NestorResourcesHttpApi;
}

export default function mkResourcesHttpApi(
  id: string,
  args: NestorResourcesHttpApiArgs,
  _variables: NestorEnvironmentVariables,
): NestorHttpApi {
  return {
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
