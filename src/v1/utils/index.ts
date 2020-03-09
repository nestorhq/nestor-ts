import AWS from 'aws-sdk';
import fs from 'fs';
import archiver from 'archiver';
import streams from 'memory-streams';

// https://stackoverflow.com/questions/21491567/how-to-implement-a-writable-stream
// http://derpturkey.com/buffer-to-stream-in-node/
// https://github.com/paulja/memory-streams-js
export async function makeZip(
  content: string,
  fileName: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = new streams.WritableStream();

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log(
        'archiver has been finalized and the output file descriptor has closed.',
      );
      resolve(output.toBuffer());
    });

    output.on('finish', () => {
      // Nothing
      resolve(output.toBuffer());
    });

    output.on('end', function() {
      // console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      reject(err);
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.append(content, { name: fileName });

    archive.finalize();
  });
}

export async function makeZipFromFile(
  inputFile: string,
  fileName: string,
  outputFile: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // create a file to stream archive data to.
    const output = outputFile
      ? fs.createWriteStream(outputFile)
      : new streams.WritableStream();

    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log(
        'archiver has been finalized and the output file descriptor has closed.',
      );
      return resolve(outputFile);
    });

    output.on('finish', () => {
      // nothing
    });

    output.on('end', function() {
      // console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      reject(err);
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    archive.append(fs.createReadStream(inputFile), { name: fileName });

    archive.finalize();
  });
}

export function e2s(err: AWS.AWSError, message?: string): string {
  return `${message || ''} - AWS Error: name=${err.name} code=${
    err.code
  } message:${err.message}`;
}

/***
const props = {
  appName: 'MyApp',
  environment: 'production',
  x1: 1,
  s1: 'abc',
};

console.log('props:', props);
[
  'hello',
  '${appName}',
  '${appname}${environment}',
  'x1 is: ${x1} and ${x1}/${s1}! s1${}',
].forEach((test) => {
  console.log(`${test} => ${replaceWithProps(test, props)}`);
});

*/

/*
makeZip('Hello world!', 'index.js')
  .then((result) => {
    console.log('result:');
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });
  */
