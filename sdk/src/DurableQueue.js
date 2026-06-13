(function () {
  'use strict';

  function DurableQueue(options) {
    this._store = options.store;
    this._sessionManager = options.sessionManager;
    this._visitorManager = options.visitorManager;
    this._syncEngine = options.syncEngine || null;
    this._pendingCallbacks = [];
  }

  DurableQueue.prototype.enqueue = function (eventType, payload) {
    var self = this;
    var user = window.AnalyticsUtils.getUser ? window.AnalyticsUtils.getUser() : {};

    var event = {
      eventId: window.AnalyticsUtils.generateId(),
      sessionId: this._sessionManager.getId(),
      visitorId: this._visitorManager.getId(),
      timestamp: window.AnalyticsUtils.now(),
      pageUrl: window.AnalyticsUtils.getPageUrl(),
      userAgent: window.AnalyticsUtils.getUserAgent(),
      eventType: eventType,
      payload: payload || {},
      user_id: user.user_id,
      email: user.email
    };

    this._store.add(event, function () {
      if (self._syncEngine) {
        self._syncEngine.notify();
      }
    });

    return event;
  };

  DurableQueue.prototype.getPendingBatch = function (batchSize, callback) {
    this._store.getPendingEvents(batchSize, callback);
  };

  DurableQueue.prototype.markSyncing = function (records, callback) {
    var ids = [];
    for (var i = 0; i < records.length; i++) {
      ids.push(records[i].id);
    }
    if (ids.length === 0) { if (callback) callback(); return; }
    this._store.updateStatus(ids, 'syncing', null, callback);
  };

  DurableQueue.prototype.markSynced = function (records, callback) {
    var ids = [];
    for (var i = 0; i < records.length; i++) {
      ids.push(records[i].id);
    }
    if (ids.length === 0) { if (callback) callback(); return; }
    var self = this;
    this._store.updateStatus(ids, 'synced', null, function () {
      self._store.deleteEvents(ids, callback);
    });
  };

  DurableQueue.prototype.markFailed = function (records, callback) {
    if (!records || records.length === 0) { if (callback) callback(); return; }
    var self = this;
    var completed = 0;

    for (var i = 0; i < records.length; i++) {
      (function (record) {
        var newCount = (record.retryCount || 0) + 1;
        self._store.updateStatus([record.id], 'pending', newCount, function () {
          completed++;
          if (completed >= records.length && callback) callback();
        });
      })(records[i]);
    }
  };

  DurableQueue.prototype.getCounts = function (callback) {
    var self = this;
    this._store.getTotalCount(function (total) {
      self._store.countByStatus('pending', function (pending) {
        self._store.countByStatus('syncing', function (syncing) {
          self._store.countByStatus('failed', function (failed) {
            if (callback) callback({
              total: total,
              pending: pending,
              syncing: syncing,
              failed: failed,
              synced: total - pending - syncing - failed
            });
          });
        });
      });
    });
  };

  window.DurableQueue = DurableQueue;
})();
