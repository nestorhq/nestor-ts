import AWS from 'aws-sdk';

export interface NestorAwsAPI {
  iam(): AWS.IAM;
  s3(): AWS.S3;
  dynamoDb(): AWS.DynamoDB;
  lambda(): AWS.Lambda;
  apiGatewayV2(): AWS.ApiGatewayV2;
}

export interface AwsApiArgs {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
}
export default (args: AwsApiArgs): NestorAwsAPI => {
  const credentials = new AWS.Credentials(
    args.accessKeyId,
    args.secretAccessKey,
    args.sessionToken,
  );
  return {
    iam(): AWS.IAM {
      return new AWS.IAM({
        credentials,
        region: args.region,
      });
    },
    s3(): AWS.S3 {
      return new AWS.S3({
        credentials,
        region: args.region,
      });
    },
    dynamoDb(): AWS.DynamoDB {
      return new AWS.DynamoDB({
        credentials,
        region: args.region,
      });
    },
    lambda(): AWS.Lambda {
      return new AWS.Lambda({
        credentials,
        region: args.region,
      });
    },
    apiGatewayV2(): AWS.ApiGatewayV2 {
      return new AWS.ApiGatewayV2({
        credentials,
        region: args.region,
      });
    },
  };
};
