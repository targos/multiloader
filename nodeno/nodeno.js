'use strict';

const util = require('util');

globalThis.window = globalThis;

window.Deno = {
  build: require('./nodeno.build.js'),
  errors: require('./nodeno.errors.js'),
  ...require('./nodeno.fs.js'),
  ...require('./nodeno.process.js'),
  version: require('./nodeno.version.js'),
  inspect: util.inspect,
  ...require('./nodeno.permissions.js'),
  test: require('./nodeno.test'),
  ...require('./nodeno.net.js'),
  ...require('./nodeno.io.js'),
};

window.crypto = require('./crypto.js');
window.performance = require('perf_hooks').performance;
window.fetch = require('node-fetch');
