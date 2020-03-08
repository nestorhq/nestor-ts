import { NestorAPI } from './types';

import { VERSION } from './version';

import mkRuntimeContext from './runtime';
import mkResources from './resources';
import mkAdmin from './admin';

export default function nestor(appName: string): NestorAPI {
  const runtime = mkRuntimeContext(process.env, process.argv, VERSION, appName);
  const resourcesHolder = mkResources();
  const adminHolder = mkAdmin(resourcesHolder);
  const vars = runtime.vars();

  // return API to script
  return {
    getVersion(): string {
      return VERSION;
    },
    variables: vars,
    resources: resourcesHolder.resourcesAPI(),
    admin: adminHolder.adminAPI(),
    exec(): Promise<void> {
      return runtime.exec(resourcesHolder);
    },
  };
}
