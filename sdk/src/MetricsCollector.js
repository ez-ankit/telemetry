(function () {
  'use strict';

  function MetricsCollector() {
    this._counters = {
      eventsEnqueued: 0,
      syncAttempts: 0,
      syncSuccesses: 0,
      syncFailures: 0,
      eventsSynced: 0,
      eventsFailed: 0,
      retryCountTotal: 0,
      transportErrors: 0
    };

    this._listeners = {};
    this._store = null;
  }

  MetricsCollector.prototype.setStore = function (store) {
    this._store = store;
  };

  MetricsCollector.prototype.recordSyncAttempt = function (eventCount) {
    this._counters.syncAttempts++;
    this._counters.eventsEnqueued += eventCount;
    this._emit('sync_attempt', { eventCount: eventCount });
  };

  MetricsCollector.prototype.recordSyncSuccess = function (eventCount) {
    this._counters.syncSuccesses++;
    this._counters.eventsSynced += eventCount;
    this._emit('sync_success', { eventCount: eventCount });
  };

  MetricsCollector.prototype.recordSyncFailure = function (eventCount) {
    this._counters.syncFailures++;
    this._counters.eventsFailed += eventCount || 1;
    this._emit('sync_failure', { eventCount: eventCount || 1 });
  };

  MetricsCollector.prototype.getSnapshot = function (callback) {
    var self = this;

    var snapshot = {
      version: window.AnalyticsUtils.VERSION,
      counters: {
        eventsEnqueued: this._counters.eventsEnqueued,
        syncAttempts: this._counters.syncAttempts,
        syncSuccesses: this._counters.syncSuccesses,
        syncFailures: this._counters.syncFailures,
        eventsSynced: this._counters.eventsSynced,
        eventsFailed: this._counters.eventsFailed,
        retryCountTotal: this._counters.retryCountTotal,
        transportErrors: this._counters.transportErrors
      },
      queue: {},
      storage: null
    };

    if (this._store) {
      this._store.getTotalCount(function (total) {
        snapshot.queue.total = total;
        self._store.countByStatus('pending', function (pending) {
          snapshot.queue.pending = pending;
          self._store.countByStatus('syncing', function (syncing) {
            snapshot.queue.syncing = syncing;
            self._store.countByStatus('failed', function (failed) {
              snapshot.queue.failed = failed;
              snapshot.queue.synced = total - pending - syncing - failed;

              self._store.getStorageEstimate(function (usage) {
                snapshot.storage = usage;
                if (callback) callback(snapshot);
              });
            });
          });
        });
      });
    } else {
      if (callback) callback(snapshot);
    }
  };

  MetricsCollector.prototype.on = function (event, handler) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(handler);
  };

  MetricsCollector.prototype.off = function (event, handler) {
    var list = this._listeners[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === handler) {
        list.splice(i, 1);
        break;
      }
    }
  };

  MetricsCollector.prototype._emit = function (event, data) {
    var list = this._listeners[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try { list[i](data); } catch (_) {}
    }
  };

  window.MetricsCollector = MetricsCollector;
})();
