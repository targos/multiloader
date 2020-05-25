'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const { isatty } = require('tty');
const { constants } = fs;

const { NotFound } = require('./nodeno.errors');

function wrapSync(fn) {
  const wrapped = function (...args) {
    try {
      return fn(...args);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new NotFound(err.message);
      }
      throw err;
    }
  };
  Object.defineProperty(wrapped, 'name', { value: fn.name });
  return wrapped;
}

function wrap(fn) {
  const wrapped = async function (...args) {
    try {
      return await fn(...args);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new NotFound(err.message);
      }
      throw err;
    }
  };
  Object.defineProperty(wrapped, 'name', { value: fn.name });
  return wrapped;
}

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

function statToFileInfo(stat) {
  return {
    isFile: stat.isFile(),
    isDirectory: stat.isDirectory(),
    isSymlink: stat.isSymbolicLink(),
    size: stat.size,
    mtime: stat.mtime,
    atime: stat.atime,
    birthtime: stat.birthtime,
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    nlink: stat.nlink,
    uid: stat.uid,
    gid: stat.gid,
    rdev: stat.rdev,
    blksize: stat.blksize,
    blocks: stat.blocks,
  };
}

function dirToDirEntry(dir) {
  return {
    name: dir.name,
    isFile: dir.isFile(),
    isDirectory: dir.isDirectory(),
    isSymlink: dir.isSymbolicLink(),
  };
}

const readTextFile = wrap(async function readTextFile(path) {
  return fs.promises.readFile(path).catch((err) => {
    if (err.code === 'EISDIR') {
      return '';
    } else {
      throw err;
    }
  });
});

const readTextFileSync = wrapSync(function readTextFileSync(path) {
  try {
    return fs.readFileSync(path);
  } catch (err) {
    if (err.code === 'EISDIR') {
      return '';
    } else {
      throw err;
    }
  }
});

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
      fs.read(this.rid, { buffer: p }, (err, read) => {
        if (err) {
          return reject(err);
        }
        if (read === 0) {
          return resolve(null);
        }
        resolve(read);
      });
    });
  }

  readSync(p) {
    const read = fs.readSync(this.rid, p);
    if (read === 0) {
      return null;
    }
    return read;
  }

  seek(offset, whence) {
    // TODO
  }

  seekSync(offset, whence) {}

  close() {
    fs.closeSync(this.rid);
  }
}

const open = wrap(function open(path, options = {}) {
  return new Promise((resolve, reject) => {
    fs.open(path, openOptionsToFlags(options), options.mode, (err, fd) => {
      if (err) {
        return reject(err);
      }
      resolve(new File(fd));
    });
  });
});

const openSync = wrapSync(function openSync(path, options = {}) {
  const fd = fs.openSync(path, openOptionsToFlags(options), options.mode);
  return new File(fd);
});

const remove = wrap(async function remove(path, options = {}) {
  if (options.recursive) {
    await fs.promises.rmdir(path, { recursive: true });
  } else {
    try {
      await fs.promises.rmdir(path);
    } catch (err) {
      await fs.promises.unlink(path);
    }
  }
});

const removeSync = wrapSync(function removeSync(path, options = {}) {
  if (options.recursive) {
    fs.rmdirSync(path, { recursive: true });
  } else {
    try {
      fs.rmdirSync(path);
    } catch (err) {
      fs.unlinkSync(path);
    }
  }
});

const makeTempDir = wrap(async function makeTempDir(options = {}) {
  const dir = options.dir
    ? `${options.dir}${path.sep}`
    : `${os.tmpdir()}${path.sep}`;
  const prefix = options.prefix || '';
  return fs.promises.mkdtemp(path.join(dir, prefix));
});

const makeTempDirSync = wrapSync(function makeTempDirSync(options = {}) {
  const dir = options.dir
    ? `${options.dir}${path.sep}`
    : `${os.tmpdir()}${path.sep}`;
  const prefix = options.prefix || '';
  return fs.mkdtempSync(path.join(dir, prefix));
});

const makeTempFile = wrap(async function makeTempFile(options = {}) {
  const dir = options.dir
    ? `${options.dir}${path.sep}`
    : `${os.tmpdir()}${path.sep}`;
  const prefix = options.prefix || '';
  // TODO: use fs.mkstemp when it's in node.
  const filePath = await fs.promises.mkdtemp(path.join(dir, prefix));
  await fs.promises.rmdir(filePath);
  await fs.promises.writeFile(filePath, '');
  return path.resolve(filePath);
});

const makeTempFileSync = wrapSync(function makeTempFileSync(options = {}) {
  const dir = options.dir
    ? `${options.dir}${path.sep}`
    : `${os.tmpdir()}${path.sep}`;
  const prefix = options.prefix || '';
  // TODO: use fs.mkstemp when it's in node.
  const filePath = fs.mkdtempSync(path.join(dir, prefix));
  fs.rmdirSync(filePath);
  fs.writeFileSync(filePath, '');
  return path.resolve(filePath);
});

const readDirSync = wrapSync(function readDirSync(dirPath) {
  const dirContent = fs.readdirSync(dirPath, { withFileTypes: true });
  return dirContent.map(dirToDirEntry);
});

async function* readDir(dirPath) {
  try {
    const dir = await fs.promises.opendir(dirPath);
    for await (const entry of dir) {
      yield dirToDirEntry(entry);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new NotFound(err.message);
    }
    throw err;
  }
}

const lstat = wrap(async function lstat(path) {
  const stat = await fs.promises.lstat(path);
  return statToFileInfo(stat);
});

const lstatSync = wrapSync(function lstatSync(path) {
  return statToFileInfo(fs.lstatSync(path));
});

const stat = wrap(async function stat(path) {
  const stat = await fs.promises.stat(path);
  return statToFileInfo(stat);
});

const statSync = wrapSync(function statSync(path) {
  return statToFileInfo(fs.statSync(path));
});

const writeFile = wrap(async function writeFile(path, data, options = {}) {
  return fs.promises.writeFile(path, data, {
    mode: options.mode,
    flag: openOptionsToFlags(options),
  });
});

const writeFileSync = wrapSync(async function writeFileSync(
  path,
  data,
  options = {},
) {
  return fs.writeFileSync(path, data, {
    mode: options.mode,
    flag: openOptionsToFlags(options),
  });
});

async function read(rid, buffer) {
  return new Promise((resolve, reject) => {
    fs.read(rid, { buffer }, (err, bytesRead) => {
      if (err) {
        return reject(err);
      }
      if (bytesRead === 0) {
        return resolve(null);
      }
      resolve(bytesRead);
    });
  });
}

function readSync(rid, buffer) {
  const bytesRead = fs.readSync(rid, buffer);
  if (bytesRead === 0) {
    return null;
  }
  return bytesRead;
}

function close(rid) {
  return fs.closeSync(rid);
}

module.exports = {
  chmod: wrap(fs.promises.chmod),
  chmodSync: wrapSync(fs.chmodSync),
  chown: wrap(fs.promises.chown),
  chownSync: wrapSync(fs.chownSync),
  copyFile: wrap(fs.promises.copyFile),
  copyFileSync: wrapSync(fs.copyFileSync),
  lstat,
  lstatSync,
  stat,
  statSync,
  mkdir: wrap(fs.promises.mkdir),
  mkdirSync: wrapSync(fs.mkdirSync),
  readFile: wrap(fs.promises.readFile),
  readFileSync: wrapSync(fs.readFileSync),
  rename: wrap(fs.promises.rename),
  renameSync: wrapSync(fs.renameSync),
  truncate: wrap(fs.promises.truncate),
  truncateSync: wrapSync(fs.truncateSync),
  readTextFile,
  readTextFileSync,
  File,
  open,
  openSync,
  remove,
  removeSync,
  makeTempDir,
  makeTempDirSync,
  makeTempFile,
  makeTempFileSync,
  create,
  createSync,
  readDir,
  readDirSync,
  writeFile,
  writeFileSync,
  read,
  readSync,
  close,
  realPath: wrap(fs.promises.realpath),
  realPathSync: wrapSync(fs.realpathSync),
  symlink: wrap(fs.promises.symlink),
  symlinkSync: wrapSync(fs.symlinkSync),
  readLink: wrap(fs.promises.readlink),
  readLinkSync: wrapSync(fs.readlinkSync),
  isatty,
  utime: wrap(fs.promises.utimes),
  utimeSync: wrapSync(fs.utimesSync),
  link: wrap(fs.promises.link),
  linkSync: wrapSync(fs.linkSync),
};
