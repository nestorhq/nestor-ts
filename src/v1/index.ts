import { NestorAPI } from './types';

import { VERSION } from './version';

import mkRuntimeContext from './runtimeContext';
import mkResources from './resources';

export default function nestor(): NestorAPI {
  const runtime = mkRuntimeContext(process.env, process.argv, VERSION);
  const resourcesHolder = mkResources();

  // return API to script
  return {
    getVersion(): string {
      return VERSION;
    },
    vars: runtime.vars(),
    resources: resourcesHolder.resourcesAPI(),
    exec(): Promise<void> {
      return runtime.exec(resourcesHolder);
    },
  };
}
