'use strict';

const arch = getArch();
const os = getOs();
const vendor = getVendor();
const env = getEnv();

module.exports = {
  target: `${arch}-${vendor}-${os}-${env}`,
  os: getOs(),
};

function getArch() {
  switch (process.arch) {
    case 'x64':
      return 'x86_64';
    // TODO: check other possible values.
    default:
      return 'unknown';
  }
}

function getOs() {
  switch (process.platform) {
    case 'win32':
      return 'windows';
    // TODO: check other possible values.
    default:
      return 'unknown';
  }
}

function getVendor() {
  // TODO: check other possible values.
  return 'pc';
}

function getEnv() {
  switch (process.platform) {
    case 'win32':
      return 'msvc';
    // TODO: check other possible values.
    default:
      return 'unknown';
  }
}
