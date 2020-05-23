'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const { constants } = fs;

function openOptionsToFlags(options = {}) {
  let flags = 0;
  if (options.read && options.write) {
    flags |= constants.O_RDWR;
  } else if (options.read) {
    flags |= constants.O_RDONLY;
  } else if (options.write) {
    flags |= constants.O_WRONLY;
  }
  if (options.append) {
    flags |= constants.O_APPEND;
  }
  if (options.truncate) {
    flags |= constants.O_TRUNC;
  }
  if (options.create) {
    flags |= constants.O_CREAT;
  }
  if (options.createNew) {
    flags |= constants.O_EXCL;
  }
  return flags;
}

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

function createSync(path) {
  return openSync(path, {
    read: true,
    write: true,
    truncate: true,
    create: true,
  });
}

function create(path) {
  return open(path, {
    read: true,
    write: true,
    truncate: true,
    create: true,
  });
}

class File {
  constructor(fd) {
    this.rid = fd;
  }

  write(p) {
    return new Promise((resolve, reject) => {
      fs.write(this.rid, p, (err, written) => {
        if (err) {
          return reject(err);
        }
        resolve(written);
      });
    });
  }

  writeSync(p) {
    return fs.writeSync(fd, p);
  }

  read(p) {
    return new Promise((resolve, reject) => {
      fs.read(fd, p, (err, read) => {
        if (err) {
          return reject(err);
        }
        resolve(read);
      });
    });
  }

  readSync(p) {
    return fs.readSync(fd, p);
  }

  seek(offset, whence) {
    // TODO
  }

  seekSync(offset, whence) {}

  close() {
    fs.closeSync(this.rid);
  }
}

function open(path, options = {}) {
  return new Promise((resolve, reject) => {
    fs.open(path, openOptionsToFlags(options), options.mode, (err, fd) => {
      if (err) {
        return reject(err);
      }
      resolve(new File(fd));
    });
  });
}

function openSync(path, options = {}) {
  const fd = fs.openSync(path, openOptionsToFlags(options), options.mode);
  return new File(fd);
}

async function remove(path, options = {}) {
  if (options.recursive) {
    await fs.promises.rmdir(path, { recursive: true });
  } else {
    try {
      await fs.promises.rmdir(path);
    } catch (err) {
      await fs.promises.unlink(path);
    }
  }
}

function removeSync(path, options = {}) {
  if (options.recursive) {
    fs.rmdirSync(path, { recursive: true });
  } else {
    try {
      fs.rmdirSync(path);
    } catch (err) {
      fs.unlinkSync(path);
    }
  }
}

function makeTempDir(options = {}) {
  const dir = options.dir || os.tmpdir();
  const prefix = options.prefix || '';
  return fs.promises.mkdtemp(path.join(dir, prefix));
}

function makeTempDirSync(options = {}) {
  const dir = options.dir || os.tmpdir();
  const prefix = options.prefix || '';
  return fs.mkdtempSync(path.join(dir, prefix));
}

function readDir(dirPath) {
  const dirContent = fs.readdirSync(dirPath);
  return dirContent.map((x) => {
    const pt = path.join(dirPath, x);
    const stats = fs.statSync(pt);
    return {
      name: x,
      isFile: stats.isFile(),
      isDir: stats.isDirectory(),
      isSymlink: stats.isSymbolicLink()
    };
  });
}

module.exports = {
  chmod: fs.promises.chmod,
  chmodSync: fs.chmodSync,
  chown: fs.promises.chown,
  chownSync: fs.chownSync,
  copyFile: fs.promises.copyFile,
  copyFileSync: fs.copyFileSync,
  lstat: fs.promises.lstat,
  stat: fs.promises.stat,
  lstatSync: fs.lstatSync,
  statSync: fs.statSync,
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
  File,
  open,
  openSync,
  remove,
  removeSync,
  makeTempDir,
  makeTempDirSync,
  create,
  createSync,
  readDir,
  readDirSync: readDir
};
