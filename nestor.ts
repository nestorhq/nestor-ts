import nestorv1 from './dist/v1';

const nestor = nestorv1();

console.log('Nestor version:', nestor.getVersion());

const s3Bucket = nestor.resources.s3({
  bucketName: `${nestor.vars.environmentName}-bucket-1234-abcde`,
});

console.log(s3Bucket.getBucketName());

nestor.exec();
