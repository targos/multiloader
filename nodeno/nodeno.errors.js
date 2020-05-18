/*

Adapted from https://raw.githubusercontent.com/denoland/deno/master/cli/js/errors.ts

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

class NotFound extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'NotFound';
  }
}
class PermissionDenied extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'PermissionDenied';
  }
}
class ConnectionRefused extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ConnectionRefused';
  }
}
class ConnectionReset extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ConnectionReset';
  }
}
class ConnectionAborted extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ConnectionAborted';
  }
}
class NotConnected extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'NotConnected';
  }
}
class AddrInUse extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AddrInUse';
  }
}
class AddrNotAvailable extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AddrNotAvailable';
  }
}
class BrokenPipe extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'BrokenPipe';
  }
}
class AlreadyExists extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'AlreadyExists';
  }
}
class InvalidData extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'InvalidData';
  }
}
class TimedOut extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'TimedOut';
  }
}
class Interrupted extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'Interrupted';
  }
}
class WriteZero extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'WriteZero';
  }
}
class UnexpectedEof extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'UnexpectedEof';
  }
}
class BadResource extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'BadResource';
  }
}
class Http extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'Http';
  }
}
class Busy extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'Busy';
  }
}

module.exports = {
  NotFound: NotFound,
  PermissionDenied: PermissionDenied,
  ConnectionRefused: ConnectionRefused,
  ConnectionReset: ConnectionReset,
  ConnectionAborted: ConnectionAborted,
  NotConnected: NotConnected,
  AddrInUse: AddrInUse,
  AddrNotAvailable: AddrNotAvailable,
  BrokenPipe: BrokenPipe,
  AlreadyExists: AlreadyExists,
  InvalidData: InvalidData,
  TimedOut: TimedOut,
  Interrupted: Interrupted,
  WriteZero: WriteZero,
  UnexpectedEof: UnexpectedEof,
  BadResource: BadResource,
  Http: Http,
  Busy: Busy,
};
