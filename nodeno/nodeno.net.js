'use strict';

const net = require('net');

class Addr {}

class NetAddr extends Addr {
  constructor(transport, hostname, port) {
    super();
    this.transport = transport;
    this.hostname = hostname;
    this.port = port;
  }
}

class UnixAddr extends Addr {
  constructor(transport, path) {
    super();
    this.transport = transport;
    this.path = path;
  }
}

class Conn {
  #buffers = [];
  #connection;
  #promise = null;

  constructor(connection) {
    this.localAddr = new NetAddr(
      'tcp',
      connection.localAddress,
      connection.localPort,
    );
    this.remoteAddr = new NetAddr(
      'tcp',
      connection.remoteAddress,
      connection.remotePort,
    );

    connection.on('data', (chunk) => {
      this.#buffers.push(chunk);
      if (this.#promise !== null) {
        this.#promise.resolve();
        this.#promise = null;
      }
    });

    this.#connection = connection;
  }

  read(p) {
    let read = 0;
    if (this.#buffers.length === 0) {
      let resolve, reject;
      const prom = new Promise((res, rej) => {
        resolve = () => res(this.read(p));
        reject = rej;
      });
      this.#promise = { resolve, reject };
      return prom;
    }
    for (const buffer of this.#buffers) {
      if (buffer.byteLength < p.byteLength - read) {
        p.set(buffer, read);
        read += buffer.byteLength;
        this.#buffers.splice(0, 1);
      } else {
        p.set(buffer.slice(0, p.byteLength - read), read);
        this.#buffers[0] = this.#buffers[0].slice(p.byteLength - read);
      }
    }
    return Promise.resolve(read);
  }

  write(p) {
    return new Promise((resolve, reject) => {
      this.#connection.write(p, (err) => {
        if (err) {
          return reject(err);
        }
        resolve(p.byteLength);
      });
    });
  }

  close() {
    this.#connection.destroy();
  }
}

class Listener {
  #connections = [];
  #promises = [];
  #server;

  constructor(hostname, port) {
    this.addr = new NetAddr('tcp', hostname, port);
    const server = net.createServer((c) => {
      if (this.#promises.length > 0) {
        const promise = this.#promises.shift();
        return promise.resolve(new Conn(c));
      } else {
        this.#connections.push(new Conn(c));
      }
    });
    server.listen(port, hostname);
    this.#server = server;
  }

  accept() {
    if (this.#connections.length > 0) {
      return this.#connections.shift();
    } else {
      let resolve, reject;
      const prom = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      this.#promises.push({ resolve, reject });
      return prom;
    }
  }

  close() {
    this.#server.close();
  }

  *[Symbol.asyncIterator]() {
    while (true) {
      yield this.accept();
    }
  }
}

function listen(options = {}) {
  const { hostname = '0.0.0.0', port = 0 } = options;
  return new Listener(hostname, port);
}

module.exports = {
  listen,
};
