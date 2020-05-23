'use strict';

globalThis.window = globalThis;

window.Deno = {
  build: require('./nodeno.build.js'),
  errors: require('./nodeno.errors.js'),
  ...require('./nodeno.fs.js'),
  ...require('./nodeno.process.js'),
  version: require('./nodeno.version.js'),
  ...require('./nodeno.inspect.js'),
  ...require('./nodeno.permissions.js'),
  test: require('./nodeno.test.js'),
  ...require('./nodeno.net.js'),
  ...require('./nodeno.io.js'),
  ...require('./nodeno.buffer.js'),
};

window.crypto = require('./crypto.js');
window.performance = require('perf_hooks').performance;
window.fetch = require('node-fetch');
window.Headers = require('node-fetch').Headers;
