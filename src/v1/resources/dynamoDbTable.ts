import {
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorEnvironmentVariables,
} from '../types';

export interface NestorDynamodbTable {
  model(): NestorResourcesDynamodbTable;
}

export default function mkResourcesDynamodbTable(
  id: string,
  args: NestorResourcesDynamoDbMonoTableArgs,
  variables: NestorEnvironmentVariables,
): NestorDynamodbTable {
  return {
    model(): NestorResourcesDynamodbTable {
      return {
        getId(): string {
          return id;
        },
        getTableName(): string {
          const name = `${variables.applicationName}-${variables.environmentName}-${args.tableName}`;
          return name;
        },
        getArn(): string {
          return 'not_available_yet';
        },
        isMonoTable(): boolean {
          return true;
        },
        grantReadDataToLambda(_lambda: NestorResourcesLambdaFunction): void {
          // TODO
        },
      };
    },
  };
}
