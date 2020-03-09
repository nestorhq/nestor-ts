import {
  NestorResourcesDynamoDbMonoTableArgs,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorEnvironmentVariables,
} from '../types';

import { ResourcesMapper } from './index';

export interface NestorDynamodbTable {
  model: NestorResourcesDynamodbTable;
}

export default function mkResourcesDynamodbTable(
  id: string,
  args: NestorResourcesDynamoDbMonoTableArgs,
  variables: NestorEnvironmentVariables,
  _mapper: ResourcesMapper,
): NestorDynamodbTable {
  return {
    model: {
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
    },
  };
}
