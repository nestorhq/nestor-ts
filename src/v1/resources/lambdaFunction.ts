import {
  NestorResourcesAPI,
  NestorResourcesS3BucketArgs,
  NestorResourcesS3Bucket,
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesLambdaFunctionArgs,
  NestorResourcesLambdaFunctionRuntime,
  NestorResourcesHttpApiArgs,
  NestorResourcesHttpApi,
  NestorEnvironmentVariables,
} from '../types';

export default function mkResourcesLambdaFunction(
  id: string,
  args: NestorResourcesLambdaFunctionArgs,
  variables: NestorEnvironmentVariables,
): NestorResourcesLambdaFunction {
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
}
