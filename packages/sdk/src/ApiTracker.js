(function () {
  'use strict';

  function ApiTracker(eventQueue) {
    this._eventQueue = eventQueue;
    this._init();
  }

  ApiTracker.prototype._init = function () {
    this._patchFetch();
    this._patchXHR();
  };

  ApiTracker.prototype._patchFetch = function () {
    var self = this;
    var originalFetch = window.fetch;

    if (!originalFetch) return;

    window.fetch = function (input, init) {
      var startTime = window.AnalyticsUtils.now();
      var method = 'GET';
      var url = '';
      var reqBody = '';

      if (typeof input === 'string') {
        url = input;
        method = (init && init.method) ? init.method.toUpperCase() : 'GET';
        reqBody = init ? window.AnalyticsUtils.safeBody(init.body) : '';
      } else if (input instanceof Request) {
        url = input.url;
        method = input.method ? input.method.toUpperCase() : 'GET';
        reqBody = window.AnalyticsUtils.safeBody(input.body);
        if (init && init.method) {
          method = init.method.toUpperCase();
          if (init.body) reqBody = window.AnalyticsUtils.safeBody(init.body);
        }
      }

      if (window.AnalyticsUtils.isAnalyticsEndpoint(url)) {
        return originalFetch.apply(this, arguments);
      }

      var promise = originalFetch.apply(this, arguments);

      promise
        .then(function (response) {
          var duration = window.AnalyticsUtils.now() - startTime;
          var cloned = response.clone();
          cloned.text().then(function (body) {
            self._eventQueue.enqueue('api_call', {
              method: method,
              url: url,
              status: cloned.status,
              duration: duration,
              success: cloned.ok,
              requestBody: reqBody,
              responseBody: window.AnalyticsUtils.truncate(body, 5000)
            });
          }).catch(function () {
            self._eventQueue.enqueue('api_call', {
              method: method,
              url: url,
              status: cloned.status,
              duration: duration,
              success: cloned.ok,
              requestBody: reqBody
            });
          });
          return response;
        })
        .catch(function (err) {
          var duration = window.AnalyticsUtils.now() - startTime;
          self._eventQueue.enqueue('api_error', {
            method: method,
            url: url,
            requestBody: reqBody,
            error: (err && err.message) ? err.message : 'Network error',
            duration: duration,
            success: false
          });
          throw err;
        });

      return promise;
    };
  };

  ApiTracker.prototype._patchXHR = function () {
    var self = this;
    var queue = this._eventQueue;
    var XHRProto = XMLHttpRequest.prototype;
    var originalOpen = XHRProto.open;
    var originalSend = XHRProto.send;

    XHRProto.open = function (method, url) {
      this._xhrMethod = method;
      this._xhrUrl = (typeof url === 'string') ? url : '';
      return originalOpen.apply(this, arguments);
    };

    XHRProto.send = function (body) {
      if (!this._xhrUrl || window.AnalyticsUtils.isAnalyticsEndpoint(this._xhrUrl)) {
        return originalSend.apply(this, arguments);
      }

      var selfXhr = this;
      var startTime = window.AnalyticsUtils.now();
      var reqBody = window.AnalyticsUtils.safeBody(body);

      this.addEventListener('loadend', function () {
        var duration = window.AnalyticsUtils.now() - startTime;
        var status = selfXhr.status;
        var ok = status >= 200 && status < 300;

        queue.enqueue(ok ? 'api_call' : 'api_error', {
          method: (selfXhr._xhrMethod || 'GET').toUpperCase(),
          url: selfXhr._xhrUrl,
          status: status,
          duration: duration,
          requestBody: reqBody,
          responseBody: ok ? window.AnalyticsUtils.truncate(selfXhr.responseText || '', 5000) : '',
          error: ok ? undefined : 'HTTP ' + status,
          success: ok
        });
      });

      return originalSend.apply(this, arguments);
    };
  };

  window.ApiTracker = ApiTracker;
})();
