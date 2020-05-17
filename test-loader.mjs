import loader from './packages/multiloader-loader/src/index.js';
export * from './packages/multiloader-loader/src/index.js';

import https from './packages/multiloader-https/src/index.js';
import json from './packages/multiloader-json/src/index.js';
import typescript from './packages/multiloader-typescript/src/index.js';
import yaml from './packages/multiloader-yaml/src/index.js';

loader(
  https({
    allowHttp: true,
  }),
  json(),
  typescript(),
  yaml(),
);
