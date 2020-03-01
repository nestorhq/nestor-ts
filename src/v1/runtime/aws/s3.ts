import AWS from 'aws-sdk';
import fs from 'fs';
import zlib from 'zlib';
import debug from 'debug';
import ora from 'ora';

const log = debug('aws');

export interface S3File {
  url: string;
}

export interface S3CopyFileArgs {
  filePath: string;
  bucketName: string;
  fileKey: string;
  contentType: string;
  compressed: boolean;
}

export interface S3Service {
  createBucket(bucketName: string, envTagName: string): Promise<void>;
  copyFileToS3(args: S3CopyFileArgs): Promise<S3File>;
  checkBucketExists(bucketName: string): Promise<boolean>;
}

export default (client: AWS.S3): S3Service => {
  return {
    async createBucket(bucketName: string, envTagName: string): Promise<void> {
      const spinner = ora(`creating bucket: ${bucketName}`).start();
      try {
        const params = {
          Bucket: bucketName,
        };
        log('Create bucket:');
        log(params);
        await client.createBucket(params).promise();

        const paramsTagging = {
          Bucket: bucketName,
          Tagging: {
            TagSet: [
              {
                Key: 'env',
                Value: envTagName,
              },
            ],
          },
        };
        await client.putBucketTagging(paramsTagging).promise();
        spinner.succeed(`bucket created: ${bucketName}`);
      } catch (err) {
        spinner.fail(`error creating bucket: ${bucketName}`);
        throw err;
      }
    },

    async checkBucketExists(bucketName: string): Promise<boolean> {
      const params = {
        Bucket: bucketName,
      };
      const spinner = ora(`check if S3 bucket exists: ${bucketName}`).start();
      return new Promise((resolve, reject) => {
        client.headBucket(params, function(err, data) {
          if (err) {
            if (err.code === 'NotFound') {
              spinner.succeed(
                `checking bucket existence :${bucketName}: bucket does not exists`,
              );
              return resolve(false);
            }
            spinner.fail(`error checking bucket existence: ${bucketName}`);
            log('Error checking: ');
            log({ bucketName });
            log(err);
            return reject(err);
          }
          spinner.succeed(
            `checking bucket existence :${bucketName}: bucket exists`,
          );
          log('data:');
          log(data);
          return resolve(true);
        });
      });
    },

    async copyFileToS3({
      filePath,
      bucketName,
      fileKey,
      contentType,
      compressed,
    }): Promise<S3File> {
      const spinner = ora(
        `copying file to S3: ${filePath} => bucket:${bucketName} key:${fileKey}`,
      ).start();
      return new Promise((resolve, reject) => {
        try {
          const readStream = fs.createReadStream(filePath);
          const body = compressed
            ? readStream.pipe(zlib.createGzip())
            : readStream;
          const params = {
            Bucket: bucketName,
            Key: fileKey,
            ContentType: contentType,
            ContentEncoding: compressed ? 'gzip' : undefined,
            Body: body,
          };

          client.upload(params).send((err, data) => {
            if (err) {
              spinner.fail(
                `error copying file to S3: ${filePath} => bucket:${bucketName} key:${fileKey}`,
              );
              log('Error copying: ');
              log({ filePath, fileKey, bucketName });
              log(err);
              return reject(err);
            }
            spinner.succeed(
              `file copied to S3: ${filePath} => bucket:${bucketName} key:${fileKey}`,
            );
            log('File copied to S3:');
            log({ data, filePath, fileKey, bucketName });
            // we return the URL of the object
            return resolve({
              url: data.Location,
            });
          });
        } catch (err) {
          if (err) {
            log('Error copying: ');
            log({ filePath, fileKey, bucketName });
            log(err);
            return reject(err);
          }
          spinner.fail(
            `error copying file to S3: ${filePath} => bucket:${bucketName} key:${fileKey}`,
          );
          reject(err);
        }
      });
    },
  };
};
