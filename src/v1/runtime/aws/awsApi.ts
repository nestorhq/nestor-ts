import AWS from 'aws-sdk';

export interface NestorAwsAPI {
  s3(): AWS.S3;
  dynamoDb(): AWS.DynamoDB;
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
  };
};
