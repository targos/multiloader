'use strict';

const util = require('util');

globalThis.Deno = {
  build: require('./nodeno.build.js'),
  errors: require('./nodeno.errors.js'),
  ...require('./nodeno.fs.js'),
  ...require('./nodeno.process.js'),
  version: require('./nodeno.version.js'),
  inspect: util.inspect,
  ...require('./nodeno.permissions.js'),
  test: require('./nodeno.test')
};

globalThis.crypto = require('./crypto.js');
globalThis.performance = require('perf_hooks').performance;
globalThis.fetch = require('node-fetch');
