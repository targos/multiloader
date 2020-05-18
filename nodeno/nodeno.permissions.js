'use strict';

class PermissionsStatus {
  constructor(state) {
    this.state = state;
  }
}

class Permissions {
  async query() {
    return new PermissionsStatus('granted');
  }

  async request() {
    return new PermissionsStatus('granted');
  }
}

module.exports = {
  PermissionsStatus,
  permissions: new Permissions(),
};
