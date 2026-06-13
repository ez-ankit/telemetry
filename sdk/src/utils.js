(function () {
  'use strict';

  var AnalyticsUtils = {};

  AnalyticsUtils.VERSION = '1.0.0';

  AnalyticsUtils.generateId = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  AnalyticsUtils.now = function () {
    return Date.now();
  };

  AnalyticsUtils.getUserAgent = function () {
    return navigator.userAgent;
  };

  AnalyticsUtils.getPageUrl = function () {
    return location.href;
  };

  AnalyticsUtils.getReferrer = function () {
    return document.referrer;
  };

  AnalyticsUtils.isAnalyticsEndpoint = function (url) {
    if (!url) return false;
    var endpoint = window._analyticsConfig && window._analyticsConfig.endpoint;
    if (!endpoint) return false;
    return url.indexOf(endpoint) !== -1;
  };

  AnalyticsUtils.supportsBeacon = function () {
    return typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';
  };

  AnalyticsUtils.supportsIndexedDB = function () {
    return typeof indexedDB !== 'undefined';
  };

  AnalyticsUtils.configValue = function (key, defaultValue) {
    if (window._analyticsConfig && window._analyticsConfig[key] !== undefined) {
      return window._analyticsConfig[key];
    }
    return defaultValue;
  };

  AnalyticsUtils.isPassiveSupported = function () {
    var supported = false;
    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function () {
          supported = true;
          return true;
        }
      });
      window.addEventListener('test', null, opts);
      window.removeEventListener('test', null, opts);
    } catch (_) {}
    return supported;
  };

  AnalyticsUtils.passiveOpts = AnalyticsUtils.isPassiveSupported()
    ? { passive: true, capture: true }
    : true;

  AnalyticsUtils.sanitizeText = function (text) {
    if (!text) return '';
    return String(text).substring(0, 200);
  };

  AnalyticsUtils.truncate = function (s, max) {
    if (!s) return '';
    s = typeof s === 'string' ? s : String(s);
    return s.length > max ? s.substring(0, max) + '...' : s;
  };

  AnalyticsUtils.safeBody = function (body) {
    if (!body) return '';
    try {
      if (typeof body === 'string') return AnalyticsUtils.truncate(body, 2000);
      if (body instanceof FormData) {
        var obj = {};
        body.forEach(function (v, k) {
          if (typeof v === 'string') { obj[k] = v; }
        });
        return AnalyticsUtils.truncate(JSON.stringify(obj), 2000);
      }
      return AnalyticsUtils.truncate(JSON.stringify(body), 2000);
    } catch (_) { return '[unserializable]'; }
  };

  AnalyticsUtils.getUser = function () {
    try {
      var s = localStorage.getItem('currentUser');
      if (s) { var p = JSON.parse(s); return { user_id: p.user_id, email: p.email, full_name: p.full_name }; }
    } catch (_) {}
    return {};
  };

  window.AnalyticsUtils = AnalyticsUtils;
})();
