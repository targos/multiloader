/*

Adapted from https://raw.githubusercontent.com/denoland/deno/master/cli/js/colors.ts

MIT License

Copyright (c) 2018-2020 the Deno authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

'use strict';

function code(open, close) {
  return {
    open: `\x1b[${open}m`,
    close: `\x1b[${close}m`,
    regexp: new RegExp(`\\x1b\\[${close}m`, 'g'),
  };
}

function run(str, code) {
  return !globalThis || !globalThis.Deno || globalThis.Deno.noColor
    ? str
    : `${code.open}${str.replace(code.regexp, code.open)}${code.close}`;
}

function bold(str) {
  return run(str, code(1, 22));
}

function italic(str) {
  return run(str, code(3, 23));
}

function yellow(str) {
  return run(str, code(33, 39));
}

function cyan(str) {
  return run(str, code(36, 39));
}

function red(str) {
  return run(str, code(31, 39));
}

function green(str) {
  return run(str, code(32, 39));
}

function bgRed(str) {
  return run(str, code(41, 49));
}

function white(str) {
  return run(str, code(37, 39));
}

function gray(str) {
  return run(str, code(90, 39));
}

function magenta(str) {
  return run(str, code(35, 39));
}

function dim(str) {
  return run(str, code(2, 22));
}

// https://github.com/chalk/ansi-regex/blob/2b56fb0c7a07108e5b54241e8faec160d393aedb/index.js
const ANSI_PATTERN = new RegExp(
  [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
  ].join('|'),
  'g',
);

function stripColor(string) {
  return string.replace(ANSI_PATTERN, '');
}

module.exports = {
  bold,
  italic,
  yellow,
  cyan,
  red,
  green,
  bgRed,
  white,
  gray,
  magenta,
  dim,
  stripColor,
};
