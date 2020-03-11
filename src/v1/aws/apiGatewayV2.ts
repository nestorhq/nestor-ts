import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';
import { e2s } from '../utils';

const log = debug('aws');

async function getIntegration(
  apigatewayv2: AWS.ApiGatewayV2,
  apiId: string,
  integrationId: string,
): Promise<AWS.ApiGatewayV2.GetIntegrationResult> {
  let theIntegrationId = integrationId;
  if (integrationId.startsWith('integrations/')) {
    theIntegrationId = integrationId.substring(13);
  }
  const params = {
    ApiId: apiId,
    IntegrationId: theIntegrationId,
  };
  const spinner = ora(
    `apigatewayv2.getIntegration ${JSON.stringify(params, null, '')}`,
  ).start();

  return new Promise((resolve, reject) => {
    apigatewayv2.getIntegration(params, function(err, data) {
      if (err) {
        spinner.fail(
          e2s(
            err,
            `apigatewayv2.getIntegration failed - ${JSON.stringify(
              params,
              null,
              '',
            )}`,
          ),
        );
        return reject(err);
      }
      spinner.succeed(
        `apigatewayv2.getIntegration success:${JSON.stringify(data, null, '')}`,
      );
      return resolve(data);
    });
  });
}

async function getRouteByKey(
  apigatewayv2: AWS.ApiGatewayV2,
  apiId: string,
  routeKey: string,
): Promise<AWS.ApiGatewayV2.Route | undefined> {
  // we suppose that there are less than 10 routes (should only have 1 anyway)
  // so no need to iterate with nextToken
  const params = {
    ApiId: apiId,
    MaxResults: '10',
  };
  const spinner = ora(
    `apigatewayv2.getRoutes ${JSON.stringify(params, null, '')}`,
  ).start();

  return new Promise((resolve, reject) => {
    apigatewayv2.getRoutes(params, function(err, data) {
      if (err) {
        spinner.fail(
          e2s(
            err,
            `apigatewayv2.getRoutes failed - ${JSON.stringify(
              params,
              null,
              '',
            )}`,
          ),
        );
        return reject(err);
      }
      spinner.succeed(
        `apigatewayv2.getRoutes success:${JSON.stringify(data, null, '')}`,
      );
      const result = data.Items?.find(i => i.RouteKey === routeKey);
      return resolve(result);
    });
  });
}

async function getRoute(
  apigatewayv2: AWS.ApiGatewayV2,
  apiId: string,
  routeId: string,
): Promise<AWS.ApiGatewayV2.GetRouteResult> {
  const params = {
    ApiId: apiId,
    RouteId: routeId,
  };
  const spinner = ora(
    `apigatewayv2.getRoute ${JSON.stringify(params, null, '')}`,
  ).start();

  return new Promise((resolve, reject) => {
    apigatewayv2.getRoute(params, function(err, data) {
      if (err) {
        spinner.fail(
          e2s(
            err,
            `apigatewayv2.getRoute failed - ${JSON.stringify(
              params,
              null,
              '',
            )}`,
          ),
        );
        return reject(err);
      }
      spinner.succeed(
        `apigatewayv2.getRoute success:${JSON.stringify(data, null, '')}`,
      );
      return resolve(data);
    });
  });
}

async function getApis(
  apigatewayv2: AWS.ApiGatewayV2,
  token?: string,
): Promise<AWS.ApiGatewayV2.GetApisResponse> {
  const params = {
    MaxResults: '10',
    NextToken: token,
  };
  const spinner = ora(
    `apigatewayv2.getApis ${JSON.stringify(params, null, '')}`,
  ).start();

  return new Promise((resolve, reject) => {
    apigatewayv2.getApis(params, function(err, data) {
      if (err) {
        spinner.fail(e2s(err, 'apigatewayv2.getApis failed'));
        return reject(err);
      }
      spinner.succeed(
        `apigatewayv2.getApis success:${JSON.stringify(
          data,
          null,
          '',
        )} ${data.Items?.map(d => d.ApiId).join(',')}`,
      );
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
    }
    if (data.NextToken) {
      token = data.NextToken;
    } else {
      return undefined;
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
        const apiId = gwapi.ApiId || '';
        // retrive route information to make sure we have the proper lambda attached to it
        const defaultRoute = await getRouteByKey(client, apiId, '$default');
        if (!defaultRoute) {
          throw new Error(
            `could not find default route for api gateway ${JSON.stringify(
              gwapi,
              null,
              '',
            )}`,
          );
        }
        log('route is:');
        log(defaultRoute);
        const routeId = defaultRoute.RouteId || '';
        const routeInfo = await getRoute(client, apiId, routeId);
        log('routeInfo is:');
        log(routeInfo);
        const integrationId = routeInfo.Target || '';
        const integration = await getIntegration(client, apiId, integrationId);
        log('integration is:');
        log(integration);
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
