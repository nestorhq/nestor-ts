import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';
import retry from 'retry';
import { makeZip } from '../utils';
const log = debug('aws');

// default code for the lambda
const defaultLambda = `exports.handler = async (event, context, callback) => {
  console.log('>lambda>event> ', JSON.stringify(event, null, '  '));
  callback();
}`;

export interface LambdaService {
  createFunction(
    functionName: string,
    handler: string,
    roleArn: string,
  ): Promise<void>;
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
  spinner: ora.Ora,
): Promise<AWS.Lambda.FunctionConfiguration> {
  const operation = retry.operation({
    retries: 5, // try 1 time and retry 5 times if needed, total = 6
    minTimeout: 1 * 1000, // the number of milliseconds before starting the first retry
    maxTimeout: 15 * 1000, // the maximum number of milliseconds between two retries
  });

  return new Promise((resolve, reject) => {
    operation.attempt(currentAttempt => {
      spinner.text = `creating lambda [${currentAttempt}]: ${params.FunctionName}`;
      createLambda(client, params)
        .then(data => {
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
    ): Promise<void> {
      try {
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
        const spinner = ora(
          `creating lambda: ${functionName} ${JSON.stringify(
            params,
            null,
            '',
          )}`,
        ).start();
        return doCreateLambdaWithRetry(client, params, spinner)
          .then((data: AWS.Lambda.FunctionConfiguration) => {
            spinner.succeed(`lambda created: ${functionName}`);
            log(data);
          })
          .catch(err => {
            spinner.fail(`lambda creation failed: ${functionName}`);
            log(err);
            throw err;
          });
      } catch (err) {
        log(err);
        throw err;
      }
    },
  };
};
