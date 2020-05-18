'use strict';

globalThis.Deno = {
  build: require('./deno.build.js'),
  errors: require('./deno.errors.js'),
  ...require('./deno.fs.js'),
  ...require('./deno.process.js'),
  version: {
    deno: '1.0.0',
    v8: process.versions.v8,
    typescript: '3.9.2',
  },
};
