import AWS from 'aws-sdk';
import debug from 'debug';
import ora from 'ora';

const log = debug('aws');

export interface DynamoDbService {
  createMonoTable(tableName: string): Promise<boolean>;
}

async function checkIfTableExists(
  client: AWS.DynamoDB,
  tableName: string,
): Promise<boolean> {
  const params = {
    TableName: tableName,
  };
  return new Promise(resolve => {
    client.describeTable(params, err => {
      if (err) {
        return resolve(false);
      } else {
        return resolve(true);
      }
    });
  });
}

export default (
  client: AWS.DynamoDB,
  appName: string,
  environmentName: string,
): DynamoDbService => {
  return {
    async createMonoTable(tableName: string): Promise<boolean> {
      const spinner = ora(`creating mono table: ${tableName}`).start();
      return new Promise(async (resolve, reject) => {
        const tableExists = await checkIfTableExists(client, tableName);
        if (tableExists) {
          spinner.succeed(`table already exists: ${tableName}`);
          return resolve(true);
        }
        const params = {
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' }, //Partition key
            { AttributeName: 'sk', KeyType: 'RANGE' }, //Sort key
          ],
          AttributeDefinitions: [
            { AttributeName: 'pk', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
          ],
          BillingMode: 'PAY_PER_REQUEST',
          // ProvisionedThroughput: {
          //   ReadCapacityUnits: 10,
          //   WriteCapacityUnits: 10,
          // },
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
          GlobalSecondaryIndexes: [
            {
              IndexName: 'gsi_1',
              KeySchema: [
                {
                  AttributeName: 'sk',
                  KeyType: 'HASH',
                },
                {
                  AttributeName: 'pk',
                  KeyType: 'RANGE',
                },
              ],
              Projection: {
                ProjectionType: 'ALL',
              },
              // ProvisionedThroughput: {
              //   ReadCapacityUnits: 10,
              //   WriteCapacityUnits: 10,
              // },
            },
          ],
        };

        log('Creating DynamoDB table:');
        log(params);

        client.createTable(params, function(err, data) {
          if (err) {
            log('Error creating table:');
            log(err);
            return reject(err);
          } else {
            log('table created:');
            log(data);
            spinner.succeed(`table created: ${tableName}`);
            return resolve(false);
          }
        });
      });
    },
  };
};
