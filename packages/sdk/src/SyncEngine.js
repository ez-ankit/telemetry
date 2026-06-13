(function () {
  'use strict';

  var DEFAULT_BATCH_SIZE = 20;
  var DEFAULT_SYNC_INTERVAL = 5000;
  var DEFAULT_MAX_RETRIES = 10;

  function SyncEngine(options) {
    this._queue = options.queue;
    this._transport = options.transport;
    this._metrics = options.metrics || null;
    this._batchSize = options.batchSize || DEFAULT_BATCH_SIZE;
    this._syncInterval = options.syncInterval || DEFAULT_SYNC_INTERVAL;
    this._maxRetries = options.maxRetries || DEFAULT_MAX_RETRIES;

    this._timer = null;
    this._syncing = false;
    this._online = true;
    this._pendingNotification = false;
    this._listeners = {};

    this._init();
  }

  SyncEngine.prototype._init = function () {
    var self = this;

    this._online = typeof navigator.onLine === 'undefined' ? true : navigator.onLine;

    window.addEventListener('online', function () {
      self._online = true;
      self._emit('online');
      self.sync();
    });

    window.addEventListener('offline', function () {
      self._online = false;
      self._emit('offline');
    });

    this._timer = setInterval(function () {
      self.sync();
    }, this._syncInterval);
  };

  SyncEngine.prototype.notify = function () {
    if (!this._syncing && this._online && !this._pendingNotification) {
      this._pendingNotification = true;
      var self = this;
      setTimeout(function () {
        self._pendingNotification = false;
        self.sync();
      }, 100);
    }
  };

  SyncEngine.prototype.sync = function () {
    if (this._syncing || !this._online) return;
    this._syncing = true;

    var self = this;
    this._queue.getPendingBatch(this._batchSize, function (records) {
      if (!records || records.length === 0) {
        self._syncing = false;
        return;
      }

      self._queue.markSyncing(records, function () {
        var batch = [];
        for (var i = 0; i < records.length; i++) {
          batch.push({
            eventId: records[i].eventId,
            sessionId: records[i].sessionId,
            visitorId: records[i].visitorId,
            timestamp: records[i].timestamp,
            pageUrl: records[i].pageUrl,
            userAgent: records[i].userAgent,
            eventType: records[i].eventType,
            payload: records[i].payload,
            user_id: records[i].user_id,
            email: records[i].email,
            full_name: records[i].full_name
          });
        }

        self._transport.sendBatch(batch, function (result) {
          if (self._metrics) {
            self._metrics.recordSyncAttempt(batch.length);
          }

          if (result.success) {
            self._queue.markSynced(records, function () {
              if (self._metrics) {
                self._metrics.recordSyncSuccess(batch.length);
              }
              self._syncing = false;
              self.sync();
            });
          } else {
            var retryable = [];
            for (var j = 0; j < records.length; j++) {
              if (records[j].retryCount < self._maxRetries) {
                retryable.push(records[j]);
              }
            }

            if (retryable.length > 0) {
              self._queue.markFailed(retryable, function () {
                if (self._metrics) {
                  self._metrics.recordSyncFailure(batch.length - retryable.length);
                }
                self._syncing = false;
              });
            } else {
              self._queue.markFailed(records, function () {
                if (self._metrics) {
                  self._metrics.recordSyncFailure(batch.length);
                }
                self._syncing = false;
              });
            }
          }
        });
      });
    });
  };

  SyncEngine.prototype.on = function (event, handler) {
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(handler);
  };

  SyncEngine.prototype.off = function (event, handler) {
    var list = this._listeners[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      if (list[i] === handler) {
        list.splice(i, 1);
        break;
      }
    }
  };

  SyncEngine.prototype._emit = function (event, data) {
    var list = this._listeners[event];
    if (!list) return;
    for (var i = 0; i < list.length; i++) {
      try { list[i](data); } catch (_) {}
    }
  };

  SyncEngine.prototype.destroy = function () {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    this._listeners = {};
  };

  window.SyncEngine = SyncEngine;
})();
