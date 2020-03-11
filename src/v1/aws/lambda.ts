import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';
import retry from 'retry';
import { makeZip, e2s } from '../utils';
const log = debug('aws');

// default code for the lambda
const defaultLambda = `exports.handler = async (event, context, callback) => {
  console.log('>lambda>event> ', JSON.stringify(event, null, '  '));
  callback();
}`;

// check if a function, idnetified by its name, exists in aws
async function awsFindLambda(
  lambdaFunctionName: string,
  client: AWS.Lambda,
): Promise<AWS.Lambda.FunctionConfiguration | null> {
  const spinner = ora(
    `check if lambda function exists: ${lambdaFunctionName}`,
  ).start();

  return new Promise((resolve, _reject) => {
    client.getFunctionConfiguration(
      {
        FunctionName: lambdaFunctionName,
      },
      (err, data) => {
        if (err) {
          // test if function does not exist
          if (err.code === 'ResourceNotFoundException') {
            spinner.succeed(
              `lambda.getFunctionConfiguration - function does not exist (${lambdaFunctionName})`,
            );
            return resolve(null);
          }
          spinner.fail(
            e2s(err, `lambda.getFunctionConfiguration(${lambdaFunctionName})`),
          );
        }
        spinner.succeed(
          `lambda.getFunctionConfiguration(${lambdaFunctionName}) ${JSON.stringify(
            data,
            null,
            '',
          )}`,
        );
        return resolve(data);
      },
    );
  });
}

export interface LambdaService {
  createFunction(
    functionName: string,
    handler: string,
    roleArn: string,
  ): Promise<AWS.Lambda.FunctionConfiguration>;
}

async function createLambda(
  client: AWS.Lambda,
  params: AWS.Lambda.CreateFunctionRequest,
): Promise<AWS.Lambda.FunctionConfiguration> {
  try {
    return new Promise(async (resolve, reject) => {
      client.createFunction(params, function(err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  } catch (err) {
    throw err;
  }
}

async function doCreateLambdaWithRetry(
  client: AWS.Lambda,
  params: AWS.Lambda.CreateFunctionRequest,
): Promise<AWS.Lambda.FunctionConfiguration> {
  const operation = retry.operation({
    retries: 5, // try 1 time and retry 5 times if needed, total = 6
    minTimeout: 1 * 1000, // the number of milliseconds before starting the first retry
    maxTimeout: 15 * 1000, // the maximum number of milliseconds between two retries
  });

  const spinner = ora(
    `creating lambda: ${params.FunctionName} ${JSON.stringify(
      params,
      null,
      '',
    )}`,
  ).start();

  return new Promise((resolve, reject) => {
    operation.attempt(currentAttempt => {
      spinner.text = `creating lambda [${currentAttempt}]: ${params.FunctionName}`;
      createLambda(client, params)
        .then(data => {
          spinner.succeed(`lambda created: ${params.FunctionName}`);
          return resolve(data);
        })
        .catch(err => {
          if (
            operation.retry(err) &&
            err.code === 'InvalidParameterValueException'
          ) {
            return;
          }
          if (err) {
            spinner.fail(
              e2s(err, `error creating function ${params.FunctionName}`),
            );
            return reject(err);
          }
        });
    });
  });
}

async function updateLambdaConfiguration(
  client: AWS.Lambda,
  params: AWS.Lambda.UpdateFunctionConfigurationRequest,
): Promise<AWS.Lambda.FunctionConfiguration> {
  try {
    return new Promise(async (resolve, reject) => {
      client.updateFunctionConfiguration(params, function(err, data) {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  } catch (err) {
    throw err;
  }
}

async function doUpdateLambdaConfigurationWithRetry(
  client: AWS.Lambda,
  params: AWS.Lambda.UpdateFunctionConfigurationRequest,
): Promise<AWS.Lambda.FunctionConfiguration> {
  const operation = retry.operation({
    retries: 5, // try 1 time and retry 5 times if needed, total = 6
    minTimeout: 1 * 1000, // the number of milliseconds before starting the first retry
    maxTimeout: 15 * 1000, // the maximum number of milliseconds between two retries
  });

  const spinner = ora(
    `update lambda configuration: ${params.FunctionName} ${JSON.stringify(
      params,
      null,
      '',
    )}`,
  ).start();
  return new Promise((resolve, reject) => {
    operation.attempt(currentAttempt => {
      spinner.text = `updating lambda [${currentAttempt}]: ${params.FunctionName}`;
      updateLambdaConfiguration(client, params)
        .then(data => {
          spinner.succeed(`function updated ${params.FunctionName}`);
          return resolve(data);
        })
        .catch(err => {
          if (
            operation.retry(err) &&
            err.code === 'InvalidParameterValueException'
          ) {
            return;
          }
          if (err) {
            spinner.fail(
              e2s(err, `error updating function ${params.FunctionName}`),
            );
            return reject(err);
          }
        });
    });
  });
}

export default (
  client: AWS.Lambda,
  appName: string,
  environmentName: string,
): LambdaService => {
  return {
    async createFunction(
      functionName: string,
      handler: string,
      roleArn: string,
    ): Promise<AWS.Lambda.FunctionConfiguration> {
      try {
        const funcData = await awsFindLambda(functionName, client);
        log(funcData);
        if (funcData) {
          const updateParams = {
            Description: '',
            FunctionName: functionName,
            Handler: handler,
            MemorySize: 128,
            Role: roleArn,
            Runtime: 'nodejs12.x',
          };
          const data = await doUpdateLambdaConfigurationWithRetry(
            client,
            updateParams,
          );
          log(data);
          return data;
        }

        const codeZip = await makeZip(defaultLambda, 'lambda.js');

        const params = {
          Code: {
            ZipFile: codeZip,
          },
          Description: '',
          FunctionName: functionName,
          Handler: handler,
          MemorySize: 128,
          Publish: true,
          Role: roleArn,
          Runtime: 'nodejs12.x',
          Timeout: 15,
          Tags: {
            app: appName,
            env: environmentName,
          },
        };
        const data = await doCreateLambdaWithRetry(client, params);
        log(data);
        return data;
      } catch (err) {
        log(err);
        throw err;
      }
    },
  };
};
