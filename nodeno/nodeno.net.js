'use strict';

const net = require('net');

class Listener {}

function listen(options = {}) {
  const { hostname = '0.0.0.0', port = 0 } = options;
  return new Listener(hostname, port);
}

module.exports = {
  listen,
};
