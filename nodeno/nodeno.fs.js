'use strict';

const fs = require('fs');

async function readTextFile(path) {
  return fs.promises.readFile(path).catch((err) => {
    if (err.code === 'EISDIR') {
      return '';
    } else {
      throw err;
    }
  });
}

function readTextFileSync(path) {
  try {
    return fs.readFileSync(path);
  } catch (err) {
    if (err.code === 'EISDIR') {
      return '';
    } else {
      throw err;
    }
  }
}

const fsMethods = {
  chmod: fs.promises.chmod,
  chmodSync: fs.chmodSync,
  chown: fs.promises.chown,
  chownSync: fs.chownSync,
  copyFile: fs.promises.copyFile,
  copyFileSync: fs.copyFileSync,
  lstat: fs.promises.lstat,
  lstatSync: fs.lstatSync,
  mkdir: fs.promises.mkdir,
  mkdirSync: fs.mkdirSync,
  readFile: fs.promises.readFile,
  readFileSync: fs.readFileSync,
  rename: fs.promises.rename,
  renameSync: fs.renameSync,
  truncate: fs.promises.truncate,
  truncateSync: fs.truncateSync,
  readTextFile,
  readTextFileSync,
};

module.exports = fsMethods;
