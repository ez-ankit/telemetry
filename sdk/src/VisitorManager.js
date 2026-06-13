(function () {
  'use strict';

  var VISITOR_KEY = '_avid';

  function VisitorManager() {
    this._visitorId = null;
    this._init();
  }

  VisitorManager.prototype._init = function () {
    try {
      var stored = localStorage.getItem(VISITOR_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        if (parsed.id) {
          this._visitorId = parsed.id;
          this._visitorData = parsed;
          return;
        }
      }
    } catch (_) {}

    this._createNew();
  };

  VisitorManager.prototype._createNew = function () {
    this._visitorId = window.AnalyticsUtils.generateId();
    this._visitorData = {
      id: this._visitorId,
      firstSeen: Date.now(),
      lastSeen: Date.now()
    };
    this._persist();
  };

  VisitorManager.prototype._persist = function () {
    try {
      this._visitorData.lastSeen = Date.now();
      localStorage.setItem(VISITOR_KEY, JSON.stringify(this._visitorData));
    } catch (_) {}
  };

  VisitorManager.prototype.getId = function () {
    return this._visitorId;
  };

  window.VisitorManager = VisitorManager;
})();
