export interface NestorAPI {
  getVersion(): string;
}

const VERSION = '0.0.1';

export default function nestor(): NestorAPI {
  return {
    getVersion(): string {
      return VERSION;
    },
  };
}
