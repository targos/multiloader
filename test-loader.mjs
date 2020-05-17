import loader from './packages/multiloader-loader/src/loader.js';
export * from './packages/multiloader-loader/src/loader.js';

import https from './packages/multiloader-https/src/httpsLoader.js';
import json from './packages/multiloader-json/src/jsonLoader.js';
import typescript from './packages/multiloader-typescript/src/typescriptLoader.js';
import yaml from './packages/multiloader-yaml/src/yamlLoader.js';
import babel from './packages/multiloader-babel/src/babelLoader.js';

loader(
  https({
    allowHttp: true,
  }),
  json(),
  typescript(),
  babel({
    presets: ['@babel/preset-react'],
  }),
  yaml(),
);
