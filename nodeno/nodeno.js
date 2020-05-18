'use strict';

const util = require('util');

globalThis.Deno = {
  build: require('./nodeno.build.js'),
  errors: require('./nodeno.errors.js'),
  ...require('./nodeno.fs.js'),
  ...require('./nodeno.process.js'),
  version: {
    deno: '1.0.0',
    v8: process.versions.v8,
    typescript: '3.9.2',
  },
  inspect: util.inspect,
};

globalThis.crypto = require('./crypto.js');
