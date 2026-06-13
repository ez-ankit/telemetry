(function () {
  'use strict';

  var DB_NAME = '_analytics_db';
  var STORE_NAME = 'events';
  var DB_VERSION = 1;

  function IndexedDBStore() {
    this._db = null;
    this._ready = false;
    this._pendingOps = [];
    this._open();
  }

  IndexedDBStore.prototype._open = function () {
    if (typeof indexedDB === 'undefined') {
      this._ready = false;
      return;
    }

    var self = this;
    var request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = function (e) {
      var db = e.target.result;
      var tx = e.target.transaction;

      if (e.oldVersion < 1) {
        var store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('idx_eventId', 'eventId', { unique: true });
        store.createIndex('idx_syncStatus', 'syncStatus', { unique: false });
        store.createIndex('idx_timestamp', 'timestamp', { unique: false });
        return;
      }

      if (e.oldVersion < 2) {
        var store = e.target.transaction.objectStore(STORE_NAME);
        try { store.deleteIndex('idx_status'); } catch (_) {}
        if (!store.indexNames.contains('idx_eventId')) { store.createIndex('idx_eventId', 'eventId', { unique: true }); }
        if (!store.indexNames.contains('idx_syncStatus')) { store.createIndex('idx_syncStatus', 'syncStatus', { unique: false }); }
        if (!store.indexNames.contains('idx_timestamp')) { store.createIndex('idx_timestamp', 'timestamp', { unique: false }); }
      }
    };

    request.onsuccess = function (e) {
      self._db = e.target.result;
      self._ready = true;
      self._flushPending();
    };

    request.onerror = function () {
      self._ready = false;
    };
  };

  IndexedDBStore.prototype._flushPending = function () {
    var ops = this._pendingOps;
    this._pendingOps = [];
    for (var i = 0; i < ops.length; i++) {
      ops[i]();
    }
  };

  IndexedDBStore.prototype._whenReady = function (fn) {
    var self = this;
    if (this._ready && this._db) {
      fn();
    } else {
      this._pendingOps.push(function () { fn.call(self); });
    }
  };

  IndexedDBStore.prototype.add = function (eventData, callback) {
    var self = this;
    this._whenReady(function () {
      if (!self._db) { if (callback) callback(null); return; }

      var tx = self._db.transaction([STORE_NAME], 'readwrite');
      var store = tx.objectStore(STORE_NAME);

      var record = {
        eventId: eventData.eventId,
        sessionId: eventData.sessionId,
        visitorId: eventData.visitorId,
        timestamp: eventData.timestamp,
        pageUrl: eventData.pageUrl,
        userAgent: eventData.userAgent,
        eventType: eventData.eventType,
        payload: eventData.payload,
        user_id: eventData.user_id,
        email: eventData.email,
        full_name: eventData.full_name,
        syncStatus: 'pending',
        retryCount: 0,
        lastAttempt: null,
        createdAt: Date.now()
      };

      var req = store.add(record);

      req.onsuccess = function () {
        if (callback) callback(record);
      };
      req.onerror = function () {
        if (callback) callback(null);
      };
    });
  };

  IndexedDBStore.prototype.getPendingEvents = function (limit, callback) {
    var self = this;
    this._whenReady(function () {
      if (!self._db) { if (callback) callback([]); return; }

      var tx = self._db.transaction([STORE_NAME], 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var index = store.index('idx_syncStatus');
      var range = IDBKeyRange.only('pending');
      var results = [];

      var req = index.openCursor(range);

      req.onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          results.sort(function (a, b) { return a.timestamp - b.timestamp; });
          if (callback) callback(results);
        }
      };

      req.onerror = function () {
        if (callback) callback([]);
      };
    });
  };

  IndexedDBStore.prototype.updateStatus = function (ids, status, retryCount, callback) {
    var self = this;
    this._whenReady(function () {
      if (!self._db || !ids || ids.length === 0) { if (callback) callback(); return; }

      var tx = self._db.transaction([STORE_NAME], 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var completed = 0;

      for (var i = 0; i < ids.length; i++) {
        (function (id) {
          var req = store.get(id);
          req.onsuccess = function (e) {
            var record = e.target.result;
            if (!record) {
              completed++;
              if (completed >= ids.length && callback) callback();
              return;
            }
            record.syncStatus = status;
            record.lastAttempt = Date.now();
            if (typeof retryCount === 'number') {
              record.retryCount = retryCount;
            }
            store.put(record);
            completed++;
            if (completed >= ids.length && callback) callback();
          };
          req.onerror = function () {
            completed++;
            if (completed >= ids.length && callback) callback();
          };
        })(ids[i]);
      }
    });
  };

  IndexedDBStore.prototype.deleteEvents = function (ids, callback) {
    var self = this;
    this._whenReady(function () {
      if (!self._db || !ids || ids.length === 0) { if (callback) callback(); return; }

      var tx = self._db.transaction([STORE_NAME], 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var completed = 0;

      for (var i = 0; i < ids.length; i++) {
        (function (id) {
          var req = store.delete(id);
          req.onsuccess = function () {
            completed++;
            if (completed >= ids.length && callback) callback();
          };
          req.onerror = function () {
            completed++;
            if (completed >= ids.length && callback) callback();
          };
        })(ids[i]);
      }
    });
  };

  IndexedDBStore.prototype.countByStatus = function (status, callback) {
    var self = this;
    this._whenReady(function () {
      if (!self._db) { if (callback) callback(0); return; }

      var tx = self._db.transaction([STORE_NAME], 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var index = store.index('idx_syncStatus');
      var range = IDBKeyRange.only(status);

      var req = index.count(range);

      req.onsuccess = function (e) {
        if (callback) callback(e.target.result || 0);
      };
      req.onerror = function () {
        if (callback) callback(0);
      };
    });
  };

  IndexedDBStore.prototype.getTotalCount = function (callback) {
    var self = this;
    this._whenReady(function () {
      if (!self._db) { if (callback) callback(0); return; }

      var tx = self._db.transaction([STORE_NAME], 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var req = store.count();

      req.onsuccess = function (e) {
        if (callback) callback(e.target.result || 0);
      };
      req.onerror = function () {
        if (callback) callback(0);
      };
    });
  };

  IndexedDBStore.prototype.getStorageEstimate = function (callback) {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (estimate) {
        if (callback) callback(estimate.usage || 0);
      }).catch(function () {
        if (callback) callback(null);
      });
    } else {
      if (callback) callback(null);
    }
  };

  window.IndexedDBStore = IndexedDBStore;
})();
