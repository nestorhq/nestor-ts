import { NestorAPI } from './types';

import { VERSION } from './version';

export interface ProcessEnv {
  [key: string]: string | undefined;
}

import mkRuntimeContext from './runtimeContext';

export default function nestor(): NestorAPI {
  const runtime = mkRuntimeContext(process.env, process.argv, VERSION);

  // return API to script
  return {
    getVersion(): string {
      return VERSION;
    },
    vars: runtime.vars(),
    resources: runtime.resources(),
    exec(): Promise<void> {
      return runtime.exec();
    },
  };
}
