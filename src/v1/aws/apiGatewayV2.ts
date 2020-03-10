import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';

const log = debug('aws');

async function getApis(
  apigatewayv2: AWS.ApiGatewayV2,
  token?: string,
): Promise<AWS.ApiGatewayV2.GetApisResponse> {
  const params = {
    MaxResults: '10',
    NextToken: token,
  };
  return new Promise((resolve, reject) => {
    apigatewayv2.getApis(params, function(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

async function getApiByName(
  apigatewayv2: AWS.ApiGatewayV2,
  apiName: string,
): Promise<AWS.ApiGatewayV2.Api | undefined> {
  for (let token: string | undefined = undefined; ; ) {
    const data: AWS.ApiGatewayV2.GetApisResponse = await getApis(
      apigatewayv2,
      token,
    );
    if (data.Items) {
      const myApi = data.Items.find(d => d.Name === apiName);
      if (myApi) {
        return myApi;
      }
    } else {
      if (data.NextToken) {
        token = data.NextToken;
      } else {
        return undefined;
      }
    }
  }
}

export interface ApiGatewayV2Service {
  createHttpApi(
    apiName: string,
    lambdaTargetArn: string,
  ): Promise<AWS.ApiGatewayV2.CreateApiResponse>;
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
    ): Promise<AWS.ApiGatewayV2.CreateApiResponse> {
      // check if API already exists
      const gwapi = await getApiByName(client, apiName);
      if (gwapi) {
        return gwapi;
      }
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
        return data;
      } catch (err) {
        spinner.fail(`error creating API: ${apiName}`);
        throw err;
      }
    },
  };
};
