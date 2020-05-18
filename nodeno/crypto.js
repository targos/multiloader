'use strict';

const crypto = require('crypto');

module.exports = {
  getRandomValues(array) {
    return crypto.randomFillSync(array);
  },
};
