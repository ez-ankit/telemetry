(function () {
  'use strict';

  var SESSION_KEY = '_asid';
  var SESSION_EXPIRY = 30 * 60 * 1000;

  function SessionManager() {
    this._sessionId = null;
    this._lastActivity = 0;
    this._init();
  }

  SessionManager.prototype._init = function () {
    try {
      var stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed.id && parsed.expiry > Date.now()) {
          this._sessionId = parsed.id;
          this._lastActivity = parsed.lastActivity || Date.now();
          this._touch();
          return;
        }
      }
    } catch (_) {}

    this._createNew();
  };

  SessionManager.prototype._createNew = function () {
    this._sessionId = window.AnalyticsUtils.generateId();
    this._lastActivity = Date.now();
    this._persist();
  };

  SessionManager.prototype._touch = function () {
    this._lastActivity = Date.now();
    this._persist();
  };

  SessionManager.prototype._persist = function () {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: this._sessionId,
          expiry: Date.now() + SESSION_EXPIRY,
          lastActivity: this._lastActivity
        })
      );
    } catch (_) {}
  };

  SessionManager.prototype.getId = function () {
    return this._sessionId;
  };

  window.SessionManager = SessionManager;
})();
