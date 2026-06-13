(function () {
  'use strict';

  function AnalyticsSDK() {
    if (window._analyticsInstance) {
      return window._analyticsInstance;
    }

    this.version = window.AnalyticsUtils.VERSION;
    this._initialized = false;
    this._sessionManager = null;
    this._visitorManager = null;
    this._store = null;
    this._transport = null;
    this._durableQueue = null;
    this._syncEngine = null;
    this._eventQueue = null;
    this._metrics = null;
    this._pageTracker = null;
    this._clickTracker = null;
    this._apiTracker = null;

    this._init();
    window._analyticsInstance = this;
  }

  AnalyticsSDK.prototype._init = function () {
    if (this._initialized) return;
    this._initialized = true;

    this._sessionManager = new window.SessionManager();
    this._visitorManager = new window.VisitorManager();
    this._store = new window.IndexedDBStore();
    this._transport = new window.Transport();
    this._metrics = new window.MetricsCollector();
    this._metrics.setStore(this._store);

    this._durableQueue = new window.DurableQueue({
      store: this._store,
      sessionManager: this._sessionManager,
      visitorManager: this._visitorManager
    });

    this._syncEngine = new window.SyncEngine({
      queue: this._durableQueue,
      transport: this._transport,
      metrics: this._metrics,
      batchSize: window._analyticsConfig && window._analyticsConfig.batchSize,
      syncInterval: window._analyticsConfig && window._analyticsConfig.syncInterval,
      maxRetries: window._analyticsConfig && window._analyticsConfig.maxRetries
    });

    this._durableQueue._syncEngine = this._syncEngine;

    this._eventQueue = new window.EventQueue({
      durableQueue: this._durableQueue
    });

    window._analyticsEventQueue = this._eventQueue;

    this._pageTracker = new window.PageTracker(this._durableQueue);
    this._clickTracker = new window.ClickTracker(this._durableQueue);
    this._apiTracker = new window.ApiTracker(this._durableQueue);
  };

  AnalyticsSDK.prototype.getSessionId = function () {
    return this._sessionManager ? this._sessionManager.getId() : null;
  };

  AnalyticsSDK.prototype.getVisitorId = function () {
    return this._visitorManager ? this._visitorManager.getId() : null;
  };

  AnalyticsSDK.prototype.track = function (eventType, payload) {
    if (this._eventQueue) {
      return this._eventQueue.enqueue(eventType, payload);
    }
    return null;
  };

  AnalyticsSDK.prototype.flush = function () {
    if (this._syncEngine) {
      this._syncEngine.sync();
    }
  };

  AnalyticsSDK.prototype.getMetrics = function (callback) {
    if (this._metrics) {
      this._metrics.getSnapshot(callback);
    } else if (callback) {
      callback(null);
    }
  };

  AnalyticsSDK.prototype.on = function (event, handler) {
    if (this._syncEngine) {
      this._syncEngine.on(event, handler);
    }
    if (this._metrics) {
      this._metrics.on(event, handler);
    }
  };

  AnalyticsSDK.prototype.off = function (event, handler) {
    if (this._syncEngine) {
      this._syncEngine.off(event, handler);
    }
    if (this._metrics) {
      this._metrics.off(event, handler);
    }
  };

  AnalyticsSDK.prototype.destroy = function () {
    if (this._syncEngine) {
      this._syncEngine.destroy();
    }
    this._sessionManager = null;
    this._visitorManager = null;
    this._store = null;
    this._transport = null;
    this._durableQueue = null;
    this._syncEngine = null;
    this._eventQueue = null;
    this._metrics = null;
    this._pageTracker = null;
    this._clickTracker = null;
    this._apiTracker = null;
    this._initialized = false;
    window._analyticsInstance = null;
    window._analyticsEventQueue = null;
  };

  window.AnalyticsSDK = AnalyticsSDK;
})();
