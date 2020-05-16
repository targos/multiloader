import loader from './packages/multiloader-loader/src/index.js';
export * from './packages/multiloader-loader/src/index.js';

import https from './packages/multiloader-https/src/index.js';
import typescript from './packages/multiloader-typescript/src/index.js';

loader(https(), typescript());
