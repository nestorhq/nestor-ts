import { NestorAwsAPI } from './awsApi';

import {
  resourcesVisit,
  ResourcesVisitor,
  S3Visitor,
  DynamoDbVisitor,
  LambdaVisitor,
  HttpApiVisitor,
} from '../utils/visitor';

import { NestorDynamodbTable } from '../resources/dynamoDbTable';
import { NestorHttpApi } from '../resources/httpApi';
import { NestorLambdaFunction } from '../resources/lambdaFunction';
import { NestorS3Bucket } from '../resources/s3Bucket';

import { NestorResources } from '../resources';
import mkS3 from './s3';
import mkDynamoDb from './dynamoDb';
import mkLambda from './lambda';
import mkRole from './role';
import mkApiGatewayV2 from './apiGatewayV2';

function s3Deployer(
  awsApi: NestorAwsAPI,
  appName: string,
  environmentName: string,
): S3Visitor {
  const clientS3 = mkS3(awsApi.s3(), appName, environmentName);

  return {
    async visit(s3Resource: NestorS3Bucket, _idx: number): Promise<void> {
      const alreadyExists = await clientS3.checkBucketExists(
        s3Resource.model().getBucketName(),
      );
      if (!alreadyExists) {
        await clientS3.createBucket(s3Resource.model().getBucketName());
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
      dynamoDbTableResource: NestorDynamodbTable,
      _idx: number,
    ): Promise<void> {
      await clientDynamoDb.createMonoTable(
        dynamoDbTableResource.model().getTableName(),
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
    async visit(lambda: NestorLambdaFunction, _idx: number): Promise<void> {
      const roleInfo = await clientRole.createLambdaRole(
        `role-${appName}-${environmentName}-lambda-${lambda.model().getId()}`,
        lambda.model().getFunctionName(),
      );
      const data = await clientLambda.createFunction(
        lambda.model().getFunctionName(),
        lambda.model().getHandlerName(),
        roleInfo.arn,
      );
      lambda.setArn(data.FunctionArn);
    },
  };
}

function httpApiDeployer(
  awsApi: NestorAwsAPI,
  appName: string,
  environmentName: string,
): HttpApiVisitor {
  const clientApiGatewayV2 = mkApiGatewayV2(
    awsApi.apiGatewayV2(),
    appName,
    environmentName,
  );
  return {
    async visit(httpApi: NestorHttpApi, _idx: number): Promise<void> {
      const apiName = `${httpApi.model().getApiName()}`;
      const targetLambda = httpApi.getTargetLambda();
      await clientApiGatewayV2.createHttpApi(apiName, 'todo');
    },
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
