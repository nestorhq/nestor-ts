import {
  NestorResourcesAPI,
  NestorResourcesS3Args,
  NestorResourcesS3,
} from './types';

export interface ResourcesRepository {
  s3Resources: NestorResourcesS3[];
}

function mkResourcesS3(args: NestorResourcesS3Args): NestorResourcesS3 {
  return {
    getBucketName(): string {
      return args.bucketName;
    },
  };
}

function mkResourcesManager(
  repository: ResourcesRepository,
): NestorResourcesAPI {
  return {
    s3(args: NestorResourcesS3Args): NestorResourcesS3 {
      const res = mkResourcesS3(args);
      repository.s3Resources.push(res);
      return res;
    },
  };
}

export interface NestorResources {
  resourcesAPI(): NestorResourcesAPI;
  resourcesRepository(): ResourcesRepository;
}

export default (): NestorResources => {
  const repository: ResourcesRepository = {
    s3Resources: [],
  };
  return {
    resourcesAPI(): NestorResourcesAPI {
      return mkResourcesManager(repository);
    },
    resourcesRepository(): ResourcesRepository {
      return repository;
    },
  };
};
