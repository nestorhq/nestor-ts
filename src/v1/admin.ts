import { NestorAdminAPI, NestorDeploymentsStorageArgs } from './types';
import { NestorResources } from './resources';

interface AdminRepository {
  deploymentBucketName?: string;
  deploymentBaseDirectory?: string;
}

function mkAdminManager(repository: AdminRepository): NestorAdminAPI {
  return {
    deploymentsStorage(args: NestorDeploymentsStorageArgs): void {
      repository.deploymentBucketName = args.bucketName;
      repository.deploymentBaseDirectory = args.baseDirectory;
    },
  };
}

export interface NestorAdmin {
  adminAPI(): NestorAdminAPI;
}

export default (_resourcesHolder: NestorResources): NestorAdmin => {
  const repository: AdminRepository = {
    deploymentBucketName: undefined,
    deploymentBaseDirectory: undefined,
  };
  return {
    adminAPI(): NestorAdminAPI {
      return mkAdminManager(repository);
    },
  };
};
