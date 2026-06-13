(function () {
  'use strict';

  var DEFAULT_ENDPOINT = '/api/analytics/collect';

  function Transport() {
    this._endpoint = DEFAULT_ENDPOINT;
    this._configEndpoint();
  }

  Transport.prototype._configEndpoint = function () {
    if (window._analyticsConfig && window._analyticsConfig.endpoint) {
      this._endpoint = window._analyticsConfig.endpoint;
    }
  };

  Transport.prototype.sendBatch = function (events, callback) {
    if (!events || events.length === 0) {
      if (callback) callback({ success: true });
      return;
    }

    var payload = JSON.stringify({ events: events });

    if (window.AnalyticsUtils.supportsBeacon()) {
      var blob = new Blob([payload], { type: 'application/json' });
      var sent = navigator.sendBeacon(this._endpoint, blob);
      if (sent) {
        if (callback) callback({ success: true });
        return;
      }
    }

    this._sendViaFetch(payload, callback);
  };

  Transport.prototype._sendViaFetch = function (payload, callback) {
    var self = this;
    fetch(this._endpoint, {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true
    })
      .then(function (res) {
        if (callback) callback({ success: res.ok, status: res.status });
      })
      .catch(function (err) {
        if (callback) callback({ success: false, error: err.message || 'Network error' });
      });
  };

  Transport.prototype.send = function (events, callback) {
    this.sendBatch(events, callback);
  };

  window.Transport = Transport;
})();
