import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';
import { makeZip } from '../../utils';
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
      const spinner = ora(`creating lambda: ${functionName}`).start();
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
        return new Promise(async (resolve, reject) => {
          client.createFunction(params, function(err, data) {
            if (err) {
              spinner.fail(`error creating lambda: ${functionName}`);
              log(params);
              log(err);
              return reject(err);
            }
            spinner.succeed(`function created :${functionName}`);
            log('data:');
            log(data);
            return resolve();
          });
        });
      } catch (err) {
        spinner.fail(`error creating lambda: ${functionName}`);
        console.log(err);
      }
    },
  };
};
