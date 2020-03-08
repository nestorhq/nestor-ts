import { NestorAwsAPI } from './awsApi';

import {
  resourcesVisit,
  ResourcesVisitor,
  S3Visitor,
  DynamoDbVisitor,
  LambdaVisitor,
  HttpApiVisitor,
} from '../utils/visitor';

import {
  NestorResourcesS3Bucket,
  NestorResourcesDynamodbTable,
  NestorResourcesLambdaFunction,
  NestorResourcesHttpApi,
} from '../types';

import { NestorResources } from '../resources';
import mkS3 from './s3';
import mkDynamoDb from './dynamoDb';
import mkLambda from './lambda';
import mkRole from './role';

function s3Deployer(
  awsApi: NestorAwsAPI,
  appName: string,
  environmentName: string,
): S3Visitor {
  const clientS3 = mkS3(awsApi.s3(), appName, environmentName);

  return {
    async visit(
      s3Resource: NestorResourcesS3Bucket,
      _idx: number,
    ): Promise<void> {
      const alreadyExists = await clientS3.checkBucketExists(
        s3Resource.getBucketName(),
      );
      if (!alreadyExists) {
        await clientS3.createBucket(s3Resource.getBucketName());
      }
    },
  };
}

function dynamoDbDeployer(
  awsApi: NestorAwsAPI,
  appName: string,
  environmentName: string,
): DynamoDbVisitor {
  const clientDynamoDb = mkDynamoDb(
    awsApi.dynamoDb(),
    appName,
    environmentName,
  );

  return {
    async visit(
      dynamoDbTableResource: NestorResourcesDynamodbTable,
      _idx: number,
    ): Promise<void> {
      await clientDynamoDb.createMonoTable(
        dynamoDbTableResource.getTableName(),
      );
    },
  };
}

function lambdaDeployer(
  awsApi: NestorAwsAPI,
  appName: string,
  environmentName: string,
): LambdaVisitor {
  const clientLambda = mkLambda(awsApi.lambda(), appName, environmentName);
  const clientRole = mkRole(awsApi.iam(), appName, environmentName);

  return {
    async visit(
      lambda: NestorResourcesLambdaFunction,
      _idx: number,
    ): Promise<void> {
      const roleInfo = await clientRole.createLambdaRole(
        `role-${appName}-${environmentName}-lambda-${lambda.getId()}`,
        lambda.getFunctionName(),
      );
      await clientLambda.createFunction(
        lambda.getFunctionName(),
        lambda.getHandlerName(),
        roleInfo.arn,
      );
    },
  };
}

function httpApiDeployer(
  awsApi: NestorAwsAPI,
  appName: string,
  environmentName: string,
): HttpApiVisitor {
  return {
    async visit(
      httpApi: NestorResourcesHttpApi,
      _idx: number,
    ): Promise<void> {},
  };
}

export default async function deploy(
  awsApi: NestorAwsAPI,
  resources: NestorResources,
  appName: string,
  environmentName: string,
): Promise<void> {
  await resourcesVisit(
    resources,
    (): ResourcesVisitor => {
      return {
        s3(): S3Visitor {
          return s3Deployer(awsApi, appName, environmentName);
        },
        dynamoDb(): DynamoDbVisitor {
          return dynamoDbDeployer(awsApi, appName, environmentName);
        },
        lambda(): LambdaVisitor {
          return lambdaDeployer(awsApi, appName, environmentName);
        },
        httpApi(): HttpApiVisitor {
          return httpApiDeployer(awsApi, appName, environmentName);
        },
      };
    },
  );
}
