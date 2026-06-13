(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Analytics SDK v1.0.0                                              */
  /*  Offline-first durable event pipeline for web applications         */
  /* ------------------------------------------------------------------ */

  var U = {}; /* AnalyticsUtils */
  const script = document.currentScript;
  const apiBaseURL = script.getAttribute("data-api-base-url") || '';
  const apiEndpoint = script.getAttribute("data-api-endpoint") || '';
  const appName = script.getAttribute("data-app-name") || 'web_app';

  U.VERSION = '1.0.0';

  U.genId = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  U.now = function () { return Date.now(); };
  U.ua = function () { return navigator.userAgent; };
  U.url = function () { return location.href; };
  U.path = function () { return location.pathname; };
  U.title = function () { return document.title; };
  U.ref = function () { return document.referrer; };

  U.getOS = function () {
    var ua = navigator.userAgent;
    if (/Windows NT 11/.test(ua)) return 'Windows 11';
    if (/Windows NT 10/.test(ua)) return 'Windows 10';
    if (/Windows NT 6\.3/.test(ua)) return 'Windows 8.1';
    if (/Windows NT 6\.2/.test(ua)) return 'Windows 8';
    if (/Windows NT 6\.1/.test(ua)) return 'Windows 7';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Linux/.test(ua)) return 'Linux';
    return navigator.platform || 'Unknown';
  };

  U.ip = '';
  U._ipFetched = false;
  U.fetchIP = function (cb) {
    if (U._ipFetched) { if (cb) cb(U.ip); return; }
    if (!U.hasFetch()) { U._ipFetched = true; if (cb) cb(''); return; }
    var ipUrl = U.cfg('ipService', 'https://api.ipify.org?format=json');
    fetch(ipUrl).then(function (r) { return r.json(); }).then(function (d) {
      U.ip = d.ip || '';
      U._ipFetched = true;
      if (cb) cb(U.ip);
    }).catch(function () {
      U._ipFetched = true;
      if (cb) cb('');
    });
  };

  U.isEp = function (url) {
    if (!url) return false;
    var ep = window._analyticsConfig && window._analyticsConfig.endpoint;
    if (ep && url.indexOf(ep) !== -1) return true;
    var defEp = apiBaseURL + apiEndpoint;
    return defEp ? url.indexOf(defEp) !== -1 : false;
  };

  U.hasBeacon = function () {
    return typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';
  };

  U.hasFetch = function () {
    return typeof fetch === 'function';
  };

  U.hasIDB = function () {
    return typeof indexedDB !== 'undefined';
  };

  U.cfg = function (k, d) {
    return (window._analyticsConfig && window._analyticsConfig[k] !== undefined) ? window._analyticsConfig[k] : d;
  };

  (function () {
    var supported = false;
    try {
      var o = Object.defineProperty({}, 'passive', { get: function () { supported = true; return true; } });
      window.addEventListener('test', null, o);
      window.removeEventListener('test', null, o);
    } catch (_) {}
    U.passive = supported ? { passive: true, capture: true } : true;
  })();

  U.sanitize = function (t) { return t ? String(t).substring(0, 200) : ''; };

  U.trackingEvents = null;
  U.shouldTrack = function (type) {
    if (!this.trackingEvents) return true;
    return this.trackingEvents.indexOf(type) !== -1;
  };

  U.getUser = function () {
    try {
      var s = localStorage.getItem('currentUser');
      if (s) { var p = JSON.parse(s); return { userId: p.user_id, email: p.email }; }
    } catch (_) {}
    return {};
  };

  U.getRole = function () {
    try {
      var s = localStorage.getItem('roles');
      if (s) {
        var list = JSON.parse(s);
        for (var i = 0; i < list.length; i++) {
          if (list[i].app_name === appName) {
            return { enterpriseId: list[i].enterprise_id, roleId: list[i].role_id };
          }
        }
      }
    } catch (_) {}
    return {};
  };

  U.truncate = function (s, max) {
    if (!s) return '';
    s = typeof s === 'string' ? s : String(s);
    return s.length > max ? s.substring(0, max) + '...' : s;
  };

  U.safeBody = function (body) {
    if (!body) return '';
    try {
      if (typeof body === 'string') return U.truncate(body, 2000);
      if (body instanceof FormData) {
        var obj = {};
        body.forEach(function (v, k) {
          if (typeof v === 'string') { obj[k] = v; }
        });
        return U.truncate(JSON.stringify(obj), 2000);
      }
      return U.truncate(JSON.stringify(body), 2000);
    } catch (_) { return '[unserializable]'; }
  };

  /* ------------------------- SessionManager ------------------------- */
  var SK = '_asid', SESS_EXP = 30 * 60 * 1000;

  function SM() {
    this._id = null;
    this._t = 0;
    this._init();
  }

  SM.prototype._init = function () {
    try {
      var s = sessionStorage.getItem(SK);
      if (s) {
        var p = JSON.parse(s);
        if (p.id && p.expiry > U.now()) {
          this._id = p.id;
          this._t = p.lastActivity || U.now();
          this._touch();
          return;
        }
      }
    } catch (_) {}
    this._id = U.genId();
    this._t = U.now();
    this._persist();
  };

  SM.prototype._touch = function () { this._t = U.now(); this._persist(); };
  SM.prototype._persist = function () {
     try { sessionStorage.setItem(SK, JSON.stringify({ id: this._id, expiry: U.now() + SESS_EXP, lastActivity: this._t })); } catch (_) {}
  };
  SM.prototype.getId = function () { return this._id; };

  /* ------------------------- VisitorManager ------------------------- */
  var VK = '_avid';

  function VM() {
    this._id = null;
    this._init();
  }

  VM.prototype._init = function () {
    try {
      var s = localStorage.getItem(VK);
      if (s) { var p = JSON.parse(s); if (p.id) { this._id = p.id; this._d = p; return; } }
    } catch (_) {}
    this._id = U.genId();
    this._d = { id: this._id, firstSeen: U.now(), lastSeen: U.now() };
    this._persist();
  };

  VM.prototype._persist = function () {
    try { this._d.lastSeen = U.now(); localStorage.setItem(VK, JSON.stringify(this._d)); } catch (_) {}
  };
  VM.prototype.getId = function () { return this._id; };

  /* -------------------------- IndexedDBStore ------------------------ */
  var DBN = '_analytics_db', SN = 'events', DBV = 2;

  function IDB() {
    this._db = null;
    this._ready = false;
    this._pq = [];
    this._open();
  }

  IDB.prototype._open = function () {
    if (!U.hasIDB()) { this._ready = false; return; }
    var self = this;
    var r = indexedDB.open(DBN, DBV);

    r.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (e.oldVersion < 1) {
        var s = db.createObjectStore(SN, { keyPath: 'id', autoIncrement: true });
        s.createIndex('idx_eventId', 'eventId', { unique: true });
        s.createIndex('idx_syncStatus', 'syncStatus', { unique: false });
        s.createIndex('idx_timestamp', 'timestamp', { unique: false });
        return;
      }
      if (e.oldVersion < 2) {
        var store = e.target.transaction.objectStore(SN);
        try { store.deleteIndex('idx_status'); } catch (_) {}
        if (!store.indexNames.contains('idx_eventId')) { store.createIndex('idx_eventId', 'eventId', { unique: true }); }
        if (!store.indexNames.contains('idx_syncStatus')) { store.createIndex('idx_syncStatus', 'syncStatus', { unique: false }); }
        if (!store.indexNames.contains('idx_timestamp')) { store.createIndex('idx_timestamp', 'timestamp', { unique: false }); }
      }
    };

    r.onsuccess = function (e) {
      self._db = e.target.result;
      self._ready = true;
      self._drain();
    };
    r.onerror = function () { self._ready = false; };
  };

  IDB.prototype._drain = function () {
    var q = this._pq; this._pq = [];
    for (var i = 0; i < q.length; i++) { q[i](); }
  };

  IDB.prototype._ok = function (fn) {
    var self = this;
    if (this._ready && this._db) { fn(); }
    else { this._pq.push(function () { fn.call(self); }); }
  };

  IDB.prototype.add = function (d, cb) {
    var self = this;
    this._ok(function () {
      if (!self._db) { if (cb) cb(null); return; }
      var tx = self._db.transaction([SN], 'readwrite');
      var r = {
        eventId: d.eventId, sessionId: d.sessionId, visitorId: d.visitorId,
        timestamp: d.timestamp, pageUrl: d.pageUrl, userAgent: d.userAgent, os: d.os, ip: d.ip,
        eventType: d.eventType, payload: d.payload,
        userId: d.userId, email: d.email,
        appName: d.appName, enterpriseId: d.enterpriseId, roleId: d.roleId,
        syncStatus: 'pending', retryCount: 0, lastAttempt: null, createdAt: U.now()
      };
      var req = tx.objectStore(SN).add(r);
      req.onsuccess = function () { if (cb) cb(r); };
      req.onerror = function () { if (cb) cb(null); };
    });
  };

  IDB.prototype.getPending = function (limit, cb) {
    var self = this;
    this._ok(function () {
      if (!self._db) { if (cb) cb([]); return; }
      var tx = self._db.transaction([SN], 'readonly');
      var cur = tx.objectStore(SN).index('idx_syncStatus').openCursor(IDBKeyRange.only('pending'));
      var res = [];
      cur.onsuccess = function (e) {
        var c = e.target.result;
        if (c && res.length < limit) { res.push(c.value); c.continue(); }
        else { res.sort(function (a, b) { return a.timestamp - b.timestamp; }); if (cb) cb(res); }
      };
      cur.onerror = function () { if (cb) cb([]); };
    });
  };

  IDB.prototype.countByStatus = function (st, cb) {
    var self = this;
    this._ok(function () {
      if (!self._db) { if (cb) cb(0); return; }
      var r = self._db.transaction([SN], 'readonly').objectStore(SN).index('idx_syncStatus').count(IDBKeyRange.only(st));
      r.onsuccess = function (e) { if (cb) cb(e.target.result || 0); };
      r.onerror = function () { if (cb) cb(0); };
    });
  };

  IDB.prototype.totalCount = function (cb) {
    var self = this;
    this._ok(function () {
      if (!self._db) { if (cb) cb(0); return; }
      var r = self._db.transaction([SN], 'readonly').objectStore(SN).count();
      r.onsuccess = function (e) { if (cb) cb(e.target.result || 0); };
      r.onerror = function () { if (cb) cb(0); };
    });
  };

  IDB.prototype.updStatus = function (ids, st, rc, cb) {
    var self = this;
    this._ok(function () {
      if (!self._db || !ids || !ids.length) { if (cb) cb(); return; }
      var tx = self._db.transaction([SN], 'readwrite');
      var os = tx.objectStore(SN);
      var done = 0;
      for (var i = 0; i < ids.length; i++) {
        (function (id) {
          var r = os.get(id);
          r.onsuccess = function (e) {
            var rec = e.target.result;
            if (!rec) { done++; if (done >= ids.length && cb) cb(); return; }
            rec.syncStatus = st;
            rec.lastAttempt = U.now();
            if (typeof rc === 'number') { rec.retryCount = rc; }
            os.put(rec);
            done++;
            if (done >= ids.length && cb) cb();
          };
          r.onerror = function () { done++; if (done >= ids.length && cb) cb(); };
        })(ids[i]);
      }
    });
  };

  IDB.prototype.del = function (ids, cb) {
    var self = this;
    this._ok(function () {
      if (!self._db || !ids || !ids.length) { if (cb) cb(); return; }
      var tx = self._db.transaction([SN], 'readwrite');
      var os = tx.objectStore(SN);
      var done = 0;
      for (var i = 0; i < ids.length; i++) {
        (function (id) {
          var r = os.delete(id);
          r.onsuccess = function () { done++; if (done >= ids.length && cb) cb(); };
          r.onerror = function () { done++; if (done >= ids.length && cb) cb(); };
        })(ids[i]);
      }
    });
  };

  IDB.prototype.storageEst = function (cb) {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (e) { if (cb) cb(e.usage || 0); }).catch(function () { if (cb) cb(null); });
    } else { if (cb) cb(null); }
  };

  /* ---------------------------- Transport --------------------------- */
  var DEF_EP  = (apiBaseURL + apiEndpoint) || 'https://nesrdewapi.ogesone.com/admin/analytics/collect';

  function T() {
    this._ep = DEF_EP;
    if (window._analyticsConfig && window._analyticsConfig.endpoint) {
      this._ep = window._analyticsConfig.endpoint;
    }
  }

  T.prototype.send = function (events, cb) {
    if (!events || !events.length) { if (cb) cb({ success: true }); return; }
    var pl = JSON.stringify({ events: events });

    var sameOrigin = this._ep.indexOf(location.origin) === 0;
    if (U.hasBeacon() && sameOrigin) {
      if (navigator.sendBeacon(this._ep, new Blob([pl], { type: 'application/json' }))) {
        if (cb) cb({ success: true });
        return;
      }
    }
    fetch(this._ep, {
      method: 'POST', body: pl, headers: { 'Content-Type': 'application/json' }, keepalive: true, credentials: 'omit'
    })
      .then(function (res) { if (cb) cb({ success: res.ok, status: res.status }); })
      .catch(function (err) { if (cb) cb({ success: false, error: err.message || 'Network error' }); });
  };

  /* --------------------------- DurableQueue ------------------------- */
  function DQ(options) {
    this._db = options.store;
    this._sm = options.sessionManager;
    this._vm = options.visitorManager;
    this._se = options.syncEngine || null;
  }

  DQ.prototype.enqueue = function (type, payload) {
    if (!U.shouldTrack(type)) return null;
    var self = this;
    var user = U.getUser();
    var role = U.getRole();
    var ev = {
      eventId: U.genId(), sessionId: this._sm.getId(), visitorId: this._vm.getId(),
      timestamp: U.now(), pageUrl: U.url(), userAgent: U.ua(), os: U.getOS(), ip: U.ip,
      eventType: type, payload: payload || {},
      userId: user.userId, email: user.email,
      appName: appName, enterpriseId: role.enterpriseId, roleId: role.roleId
    };
    this._db.add(ev, function () { if (self._se) { self._se.notify(); } });
    return ev;
  };

  DQ.prototype.getPending = function (limit, cb) { this._db.getPending(limit, cb); };

  DQ.prototype.markSyncing = function (recs, cb) {
    var ids = []; for (var i = 0; i < recs.length; i++) { ids.push(recs[i].id); }
    if (!ids.length) { if (cb) cb(); return; }
    this._db.updStatus(ids, 'syncing', null, cb);
  };

  DQ.prototype.markSynced = function (recs, cb) {
    var ids = []; for (var i = 0; i < recs.length; i++) { ids.push(recs[i].id); }
    if (!ids.length) { if (cb) cb(); return; }
    var self = this;
    this._db.updStatus(ids, 'synced', null, function () { self._db.del(ids, cb); });
  };

  DQ.prototype.markFailed = function (recs, cb) {
    if (!recs || !recs.length) { if (cb) cb(); return; }
    var self = this;
    var done = 0;
    for (var i = 0; i < recs.length; i++) {
      (function (rec) {
        self._db.updStatus([rec.id], 'pending', (rec.retryCount || 0) + 1, function () {
          done++; if (done >= recs.length && cb) cb();
        });
      })(recs[i]);
    }
  };

  DQ.prototype.getCounts = function (cb) {
    var self = this;
    this._db.totalCount(function (total) {
      self._db.countByStatus('pending', function (pending) {
        self._db.countByStatus('syncing', function (syncing) {
          self._db.countByStatus('failed', function (failed) {
            if (cb) cb({ total: total, pending: pending, syncing: syncing, failed: failed });
          });
        });
      });
    });
  };

  /* ---------------------------- SyncEngine -------------------------- */
  var DEF_BS = 20, DEF_SI = 5000, DEF_MR = 10;

  function SE(options) {
    this._q = options.queue;
    this._t = options.transport;
    this._m = options.metrics || null;
    this._bs = options.batchSize || DEF_BS;
    this._si = options.syncInterval || DEF_SI;
    this._mr = options.maxRetries || DEF_MR;
    this._timer = null;
    this._busy = false;
    this._online = true;
    this._pn = false;
    this._ls = {};
    var self = this;

    this._online = typeof navigator.onLine === 'undefined' ? true : navigator.onLine;

    window.addEventListener('online', function () { self._online = true; self._emit('online'); self.sync(); });
    window.addEventListener('offline', function () { self._online = false; self._emit('offline'); });

    this._timer = setInterval(function () { self.sync(); }, this._si);
  }

  SE.prototype.notify = function () {
    if (!this._busy && this._online && !this._pn) {
      this._pn = true;
      var self = this;
      setTimeout(function () { self._pn = false; self.sync(); }, 100);
    }
  };

  SE.prototype.sync = function () {
    if (this._busy || !this._online) return;
    this._busy = true;

    var self = this;
    this._q.getPending(this._bs, function (recs) {
      if (!recs || !recs.length) { self._busy = false; return; }

      self._q.markSyncing(recs, function () {
        var batch = [];
        for (var i = 0; i < recs.length; i++) {
          batch.push({
            eventId: recs[i].eventId, sessionId: recs[i].sessionId,
            visitorId: recs[i].visitorId, timestamp: recs[i].timestamp,
            pageUrl: recs[i].pageUrl, userAgent: recs[i].userAgent,
            os: recs[i].os, ip: recs[i].ip,
            eventType: recs[i].eventType, payload: recs[i].payload,
            userId: recs[i].userId, email: recs[i].email,
            appName: recs[i].appName, enterpriseId: recs[i].enterpriseId, roleId: recs[i].roleId
          });
        }

        self._t.send(batch, function (res) {
          if (self._m) { self._m.attempt(batch.length); }

          if (res.success) {
            self._q.markSynced(recs, function () {
              if (self._m) { self._m.success(batch.length); }
              self._busy = false;
              self.sync();
            });
          } else {
            var retry = [];
            for (var j = 0; j < recs.length; j++) {
              if (recs[j].retryCount < self._mr) { retry.push(recs[j]); }
            }
            var dropped = batch.length - retry.length;
            self._q.markFailed(retry.length ? retry : recs, function () {
              if (self._m) { self._m.failure(dropped || batch.length); }
              self._busy = false;
            });
          }
        });
      });
    });
  };

  SE.prototype.on = function (ev, fn) {
    if (!this._ls[ev]) { this._ls[ev] = []; }
    this._ls[ev].push(fn);
  };

  SE.prototype.off = function (ev, fn) {
    var l = this._ls[ev]; if (!l) return;
    for (var i = 0; i < l.length; i++) { if (l[i] === fn) { l.splice(i, 1); break; } }
  };

  SE.prototype._emit = function (ev, d) {
    var l = this._ls[ev]; if (!l) return;
    for (var i = 0; i < l.length; i++) { try { l[i](d); } catch (_) {} }
  };

  SE.prototype.destroy = function () {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._ls = {};
  };

  /* ------------------------ MetricsCollector ------------------------ */
  function MC() {
    this._c = { enqueued: 0, attempts: 0, successes: 0, failures: 0, synced: 0, failedEv: 0, retries: 0, tportErrs: 0 };
    this._ls = {};
    this._db = null;
  }

  MC.prototype.setStore = function (s) { this._db = s; };

  MC.prototype.attempt = function (n) { this._c.attempts++; this._c.enqueued += n; this._emit('sync_attempt', { n: n }); };
  MC.prototype.success = function (n) { this._c.successes++; this._c.synced += n; this._emit('sync_success', { n: n }); };
  MC.prototype.failure = function (n) { this._c.failures++; this._c.failedEv += n || 1; this._emit('sync_failure', { n: n || 1 }); };

  MC.prototype.getSnapshot = function (cb) {
    var self = this;
    var s = {
      version: U.VERSION,
      counters: {
        eventsEnqueued: this._c.enqueued, syncAttempts: this._c.attempts,
        syncSuccesses: this._c.successes, syncFailures: this._c.failures,
        eventsSynced: this._c.synced, eventsFailed: this._c.failedEv,
        retryCountTotal: this._c.retries, transportErrors: this._c.tportErrs
      },
      queue: {}, storage: null
    };

    if (this._db) {
      this._db.totalCount(function (total) {
        s.queue.total = total;
        self._db.countByStatus('pending', function (pending) {
          s.queue.pending = pending;
          self._db.countByStatus('syncing', function (syncing) {
            s.queue.syncing = syncing;
            self._db.countByStatus('failed', function (failed) {
              s.queue.failed = failed;
              self._db.storageEst(function (usage) { s.storage = usage; if (cb) cb(s); });
            });
          });
        });
      });
    } else { if (cb) cb(s); }
  };

  MC.prototype.on = function (ev, fn) {
    if (!this._ls[ev]) { this._ls[ev] = []; }
    this._ls[ev].push(fn);
  };

  MC.prototype.off = function (ev, fn) {
    var l = this._ls[ev]; if (!l) return;
    for (var i = 0; i < l.length; i++) { if (l[i] === fn) { l.splice(i, 1); break; } }
  };

  MC.prototype._emit = function (ev, d) {
    var l = this._ls[ev]; if (!l) return;
    for (var i = 0; i < l.length; i++) { try { l[i](d); } catch (_) {} }
  };

  /* --------------------------- EventQueue --------------------------- */
  function EQ(options) { this._dq = options.durableQueue; }

  EQ.prototype.enqueue = function (type, payload) { return this._dq.enqueue(type, payload); };

  EQ.prototype.flush = function () { if (this._dq && this._dq._se) { this._dq._se.sync(); } };

  EQ.prototype.getCounts = function (cb) { this._dq.getCounts(cb); };

  EQ.prototype.destroy = function () { this.flush(); };

  /* --------------------------- PageTracker -------------------------- */
  function PT(eq) {
    this._eq = eq;
    this._cu = U.url();
    this._lt = U.title();
    var self = this;

    this._track();

    var ps = history.pushState, rs = history.replaceState;
    history.pushState = function () { ps.apply(this, arguments); self._check(); };
    history.replaceState = function () { rs.apply(this, arguments); self._check(); };
    window.addEventListener('popstate', function () { self._check(); });

    var obs = new MutationObserver(function () { if (document.title !== self._lt) { self._lt = document.title; } });
    var t = document.querySelector('title');
    obs.observe(t || document.head || document.documentElement, { childList: true, subtree: true, characterData: true });
  }

  PT.prototype._track = function () {
    this._eq.enqueue('page_view', { url: U.url(), path: U.path(), title: U.title(), referrer: U.ref() });
    this._cu = U.url();
    this._lt = U.title();
  };

  PT.prototype._check = function () {
    if (U.url() !== this._cu) {
      this._eq.enqueue('page_view', { url: U.url(), path: U.path(), title: U.title(), referrer: this._cu });
      this._cu = U.url();
      this._lt = U.title();
    }
  };

  /* --------------------------- ClickTracker ------------------------- */
  function CT(eq) {
    this._eq = eq;
    var self = this;
    document.addEventListener('click', function (e) { self._handle(e); }, U.passive);
  }

  CT.prototype._handle = function (e) {
    var t = e.target;
    if (!t) return;
    var el = t.closest('a, button, input, select, textarea, [role="button"], [data-analytics]') || t;
    var tn = (el.tagName || '').toLowerCase();
    if (tn === 'body' || tn === 'html' || tn === 'document') return;

    this._eq.enqueue('click', {
      tagName: tn, elementId: el.id || '',
      className: (el.className && typeof el.className === 'string') ? el.className : '',
      text: this._text(el), href: this._href(el),
      innerText: U.sanitize(el.innerText || el.textContent || '')
    });
  };

  CT.prototype._text = function (el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { return el.placeholder || el.name || el.type || ''; }
    var t = '';
    if (el.childNodes) { for (var i = 0; i < el.childNodes.length; i++) { if (el.childNodes[i].nodeType === 3) { t += el.childNodes[i].textContent || ''; } } }
    return U.sanitize(t.trim().substring(0, 100));
  };

  CT.prototype._href = function (el) {
    if (el.tagName === 'A') { return el.getAttribute('href') || ''; }
    if (el.tagName === 'AREA') { return el.href || ''; }
    return '';
  };

  /* ---------------------------- ApiTracker -------------------------- */
  function AT(eq) {
    this._eq = eq;
    var self = this;
    var of = window.fetch;

    if (of) {
      window.fetch = function (input, init) {
        var st = U.now(), method = 'GET', url = '', reqBody = '';
        if (typeof input === 'string') { url = input; method = (init && init.method) ? init.method.toUpperCase() : 'GET'; reqBody = init ? U.safeBody(init.body) : ''; }
        else if (input instanceof Request) { url = input.url; method = input.method ? input.method.toUpperCase() : 'GET'; reqBody = U.safeBody(input.body); if (init && init.method) { method = init.method.toUpperCase(); if (init.body) reqBody = U.safeBody(init.body); } }

        if (U.isEp(url)) { return of.apply(this, arguments); }

        var p = of.apply(this, arguments);
        p.then(function (res) {
          var dur = U.now() - st;
          res.clone().text().then(function (body) {
            self._eq.enqueue('api_call', { method: method, url: url, status: res.status, duration: dur, success: res.ok, requestBody: reqBody, responseBody: U.truncate(body, 5000) });
          }).catch(function () {
            self._eq.enqueue('api_call', { method: method, url: url, status: res.status, duration: dur, success: res.ok, requestBody: reqBody });
          });
          return res;
        }).catch(function (err) {
          self._eq.enqueue('api_error', { method: method, url: url, requestBody: reqBody, error: (err && err.message) ? err.message : 'Network error', duration: U.now() - st, success: false });
          throw err;
        });
        return p;
      };
    }

    var XHRP = XMLHttpRequest.prototype, oo = XHRP.open, os = XHRP.send;
    XHRP.open = function (m, u) { this._xhrM = m; this._xhrU = (typeof u === 'string') ? u : ''; return oo.apply(this, arguments); };
    XHRP.send = function (b) {
      if (!this._xhrU || U.isEp(this._xhrU)) { return os.apply(this, arguments); }
      var st = U.now(), xhr = this, reqBody = U.safeBody(b);
      this.addEventListener('loadend', function () {
        var ok = xhr.status >= 200 && xhr.status < 300;
        self._eq.enqueue(ok ? 'api_call' : 'api_error', {
          method: (xhr._xhrM || 'GET').toUpperCase(), url: xhr._xhrU,
          status: xhr.status, duration: U.now() - st,
          requestBody: reqBody, responseBody: U.truncate(xhr.responseText || '', 5000),
          error: ok ? undefined : 'HTTP ' + xhr.status, success: ok
        });
      });
      return os.apply(this, arguments);
    };
  }

  /* --------------------------- AnalyticsSDK ------------------------- */
  function AnalyticsSDK() {
    if (window._analyticsInstance) { return window._analyticsInstance; }
    this.version = U.VERSION;
    this._inited = false;
    this._sm = null; this._vm = null; this._db = null; this._t = null;
    this._dq = null; this._se = null; this._eq = null; this._m = null;
    this._pt = null; this._ct = null; this._at = null;
    this._init();
    window._analyticsInstance = this;
  }

  AnalyticsSDK.prototype._init = function () {
    if (this._inited) return;
    this._inited = true;

    var te = U.cfg('trackingEvents', script.getAttribute('data-tracking-events'));
    if (typeof te === 'string') { te = te.split(',').map(function (s) { return s.trim(); }); }
    if (Array.isArray(te) && te.length) { U.trackingEvents = te; }

    this._sm = new SM();
    this._vm = new VM();
    this._db = new IDB();
    this._t = new T();
    this._m = new MC();
    this._m.setStore(this._db);

    this._dq = new DQ({ store: this._db, sessionManager: this._sm, visitorManager: this._vm });

    this._se = new SE({
      queue: this._dq, transport: this._t, metrics: this._m,
      batchSize: U.cfg('batchSize', 20), syncInterval: U.cfg('syncInterval', 5000),
      maxRetries: U.cfg('maxRetries', 10)
    });

    this._dq._se = this._se;

    this._eq = new EQ({ durableQueue: this._dq });
    window._analyticsEventQueue = this._eq;

    this._pt = new PT(this._dq);
    this._ct = new CT(this._dq);
    this._at = new AT(this._dq);
    U.fetchIP();
  };

  AnalyticsSDK.prototype.getSessionId = function () { return this._sm ? this._sm.getId() : null; };
  AnalyticsSDK.prototype.getVisitorId = function () { return this._vm ? this._vm.getId() : null; };
  AnalyticsSDK.prototype.getVersion = function () { return this.version; };

  AnalyticsSDK.prototype.track = function (type, payload) {
    return this._eq ? this._eq.enqueue(type, payload) : null;
  };

  AnalyticsSDK.prototype.flush = function () { if (this._se) { this._se.sync(); } };

  AnalyticsSDK.prototype.getMetrics = function (cb) {
    if (this._m) { this._m.getSnapshot(cb); } else if (cb) { cb(null); }
  };

  AnalyticsSDK.prototype.on = function (ev, fn) {
    if (this._se) { this._se.on(ev, fn); }
    if (this._m) { this._m.on(ev, fn); }
  };

  AnalyticsSDK.prototype.off = function (ev, fn) {
    if (this._se) { this._se.off(ev, fn); }
    if (this._m) { this._m.off(ev, fn); }
  };

  AnalyticsSDK.prototype.destroy = function () {
    if (this._se) { this._se.destroy(); }
    this._sm = null; this._vm = null; this._db = null; this._t = null;
    this._dq = null; this._se = null; this._eq = null; this._m = null;
    this._pt = null; this._ct = null; this._at = null;
    this._inited = false;
    window._analyticsInstance = null;
    window._analyticsEventQueue = null;
  };

  window.analytics = new AnalyticsSDK();
})();
