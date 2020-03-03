import {
  NestorAdminAPI,
  NestorResourcesS3,
  NestorDeploymentsStorageArgs,
} from './types';
import { NestorResources } from './resources';

interface AdminRepository {
  deploymentBucket?: NestorResourcesS3;
  deploymentBaseDirectory?: string;
}

function mkAdminManager(repository: AdminRepository): NestorAdminAPI {
  return {
    deploymentsStorage(args: NestorDeploymentsStorageArgs): void {
      repository.deploymentBucket = args.bucket;
      repository.deploymentBaseDirectory = args.baseDirectory;
    },
  };
}

export interface NestorAdmin {
  adminAPI(): NestorAdminAPI;
}

export default (_resourcesHolder: NestorResources): NestorAdmin => {
  const repository: AdminRepository = {
    deploymentBucket: undefined,
    deploymentBaseDirectory: undefined,
  };
  return {
    adminAPI(): NestorAdminAPI {
      return mkAdminManager(repository);
    },
  };
};
