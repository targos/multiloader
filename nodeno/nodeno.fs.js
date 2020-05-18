'use strict';

const fs = require('fs');

module.exports = {
  readFileSync(file) {
    return fs.readFileSync(file);
  },
};
