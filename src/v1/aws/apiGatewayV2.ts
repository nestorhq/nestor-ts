import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';

const log = debug('aws');

export interface ApiGatewayV2Service {
  createHttpApi(apiName: string, lambdaTargetArn: string): Promise<void>;
}

export default (
  client: AWS.ApiGatewayV2,
  appName: string,
  environmentName: string,
): ApiGatewayV2Service => {
  return {
    async createHttpApi(
      apiName: string,
      lambdaTargetArn: string,
    ): Promise<void> {
      const spinner = ora(`creating api: ${apiName}`).start();
      try {
        const params = {
          Name: apiName,
          ProtocolType: 'HTTP',
          Target: lambdaTargetArn,
          Tags: {
            app: appName,
            env: environmentName,
          },
        };
        const data = await client.createApi(params).promise();

        spinner.succeed(`api created: ${apiName}`);
        log(data);
      } catch (err) {
        spinner.fail(`error creating API: ${apiName}`);
        throw err;
      }
    },
  };
};
