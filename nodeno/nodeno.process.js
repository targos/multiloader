'use strict';

const errors = require('./nodeno.errors.js');

module.exports = {
  cwd: process.cwd,
  exit: process.exit,
  execPath() {
    return process.execPath;
  },
  chdir(directory) {
    try {
      return process.chdir(directory);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new errors.NotFound(err.message);
      } else {
        // TODO: also support PermissionDenied.
        throw err;
      }
    }
  },
  args: process.argv.slice(2),
  pid: process.pid,
  noColor: Boolean(process.env.NO_COLOR),
};
