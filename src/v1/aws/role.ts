import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';
const log = debug('aws');

import { mkPolicyFromPermissions } from './policy';

// this is used to allow the function to be called
// by the lambda service
const assumePolicy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}`;

const lambdaExecutionRolePolicy =
  'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole';
const lambdaCustomPolicyName = 'NestorCustomPolicy';

async function detachRolePolicy(
  iam: AWS.IAM,
  policyArn: string,
  roleName: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const params = {
      PolicyArn: policyArn,
      RoleName: roleName,
    };
    const spinner = ora(
      `detach role policy: ${policyArn} from role: ${roleName}`,
    ).start();

    iam.detachRolePolicy(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchEntity') {
          spinner.succeed(
            `policy ${policyArn} not attached to role: ${roleName}`,
          );
          return resolve(false);
        }
        spinner.fail(
          `error detaching policy ${policyArn} from role: ${roleName}`,
        );
        log(params);
        log('Error:');
        log(err);
        return reject(err);
      }
      spinner.succeed(`policy ${policyArn}  detached from role: ${roleName}`);
      log(data);
      return resolve(true);
    });
  });
}

async function detachCustomRolePolicy(
  iam: AWS.IAM,
  roleName: string,
  policyName: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const params = {
      RoleName: roleName,
      PolicyName: policyName,
    };
    const spinner = ora(
      `deleteRolePolicy: ${JSON.stringify(params, null, '')}`,
    ).start();

    iam.deleteRolePolicy(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchEntity') {
          spinner.succeed(
            `role policy ${policyName} not attached to role: ${roleName}`,
          );
          return resolve(false);
        }
        spinner.fail(
          `error deleting policy ${policyName} from role: ${roleName}`,
        );
        log(params);
        log('Error:');
        log(err);
        return reject(err);
      }
      spinner.succeed(`deleteRolePolicy: ${JSON.stringify(params, null, '')}`);
      log(data);
      return resolve(true);
    });
  });
}

async function deleteRole(iam: AWS.IAM, roleName: string): Promise<void> {
  await detachRolePolicy(iam, lambdaExecutionRolePolicy, roleName);
  await detachCustomRolePolicy(iam, roleName, lambdaCustomPolicyName);

  return new Promise((resolve, reject) => {
    const params = {
      RoleName: roleName,
    };
    const spinner = ora(
      `deleteRole: ${JSON.stringify(params, null, '')}`,
    ).start();
    iam.deleteRole(params, (err, data) => {
      if (err) {
        spinner.fail(`deleteRole failed: ${JSON.stringify(params, null, '')}`);
        log(err);
        return reject(err);
      }
      spinner.succeed(
        `deleteRole succeed: ${JSON.stringify(params, null, '')}`,
      );
      log(data);
      return resolve();
    });
  });
}

async function doesRoleExists(
  iam: AWS.IAM,
  roleName: string,
): Promise<boolean> {
  return new Promise((resolve, _reject) => {
    const params = {
      RoleName: roleName,
    };
    const spinner = ora(`getRole: ${JSON.stringify(params, null, '')}`).start();
    iam.getRole(params, (err, data) => {
      if (err) {
        if (err.code === 'NoSuchEntity') {
          spinner.succeed(`role does not exist ${roleName}`);
          return resolve(false);
        }
        spinner.fail(`getRole fails: ${JSON.stringify(params, null, '')}`);
        log(err);
        return resolve(false);
      }
      spinner.succeed(`getRole succeed: ${JSON.stringify(params, null, '')}`);
      log(data);
      return resolve(true);
    });
  });
}

async function attachRolePolicy(
  iam: AWS.IAM,
  policyArn: string,
  roleName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const params = {
      PolicyArn: policyArn,
      RoleName: roleName,
    };
    const spinner = ora(
      `attachRolePolicy: ${JSON.stringify(params, null, '')}`,
    ).start();
    iam.attachRolePolicy(params, (err, data) => {
      if (err) {
        spinner.fail(
          `attachRolePolicy fails: ${JSON.stringify(params, null, '')}`,
        );
        log(err);
        return reject(err);
      }
      spinner.succeed(
        `attachRolePolicy succeed: ${JSON.stringify(params, null, '')}`,
      );
      log(data);
      return resolve();
    });
  });
}

async function attachCustomRolePolicy(
  iam: AWS.IAM,
  roleName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const policyDocument = mkPolicyFromPermissions();
      // we are adding 'manually' this permission to get rid of
      // the error when called from API gateway:
      // Lambda was unable to decrypt the environment variables because KMS access was denied.
      // Please check the function's KMS key settings. KMS Exception: AccessDeniedExceptionKMS
      // Message: The ciphertext refers to a customer master key that does not exist, does not exist in this region, or you are not allowed to access.
      policyDocument.Statement.push({
        Effect: 'Allow',
        Action: ['kms:Decrypt'],
        Resource: ['*'],
      });

      const params = {
        PolicyDocument: JSON.stringify(policyDocument),
        RoleName: roleName,
        PolicyName: lambdaCustomPolicyName,
      };
      const spinner = ora(
        `putRolePolicy: ${JSON.stringify(params, null, '')}`,
      ).start();
      iam.putRolePolicy(params, (err, data) => {
        if (err) {
          spinner.fail(
            `putRolePolicy failed: ${JSON.stringify(params, null, '')}`,
          );
          log(err);
          return reject(err);
        }
        spinner.succeed(
          `putRolePolicy succeed: ${JSON.stringify(params, null, '')}`,
        );
        log(data);
        return resolve();
      });
    } catch (err) {
      log(err);
      return reject(err);
    }
  });
}

interface AwsRoleInformation {
  arn: string;
}

export interface IamService {
  createLambdaRole(
    roleName: string,
    lambdaFunctionName: string,
  ): Promise<AwsRoleInformation>;
}

export default (
  iam: AWS.IAM,
  appName: string,
  environmentName: string,
): IamService => {
  return {
    async createLambdaRole(
      roleName: string,
      lambdaFunctionName: string,
    ): Promise<AwsRoleInformation> {
      // delete role if already exist
      // TODO: doesn't work
      // DeleteConflict: Cannot delete entity, must detach all policies first
      const exitsRole = await doesRoleExists(iam, roleName);
      if (exitsRole) {
        log('Delete exictisng role:', roleName);
        await deleteRole(iam, roleName);
      }

      return new Promise(async (resolve, reject) => {
        const params = {
          AssumeRolePolicyDocument: assumePolicy, // No need to URL encode
          Path: '/',
          RoleName: roleName,
          Description: `role for lambda: ${lambdaFunctionName}`,
          Tags: [
            {
              Key: 'app',
              Value: appName,
            },
            {
              Key: 'env',
              Value: environmentName,
            },
          ],
        };
        const spinner = ora(
          `createRole: ${JSON.stringify(params, null, '')}`,
        ).start();

        iam.createRole(params, async (err, data) => {
          if (err) {
            spinner.fail(
              `error iam.createRole: ${JSON.stringify(params, null, '')}`,
            );
            log(err);
            return reject(err);
          }
          spinner.succeed(
            `iam.createRole succeed: ${JSON.stringify(params, null, '')}`,
          );
          log(data);
          await attachRolePolicy(iam, lambdaExecutionRolePolicy, roleName);
          await attachCustomRolePolicy(iam, roleName);
          return resolve({
            arn: data.Role.Arn,
          });
        });
      });
    },
  };
};
