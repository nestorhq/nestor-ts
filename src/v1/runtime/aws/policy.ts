interface PolicyDocument {
  Version: string;
  Statement: {
    Effect: string;
    Action: string[];
    Resource: string[];
  }[];
}
// see: https://github.com/pcarion/audiencefm_000/blob/7b9f21351f45df6f3a7b59e96d48371a8530e8fb/nestor/src/aws/policy.js
export function mkPolicyFromPermissions(): PolicyDocument {
  const document = {
    Version: '2012-10-17',
    Statement: [],
  };
  return document;
}
