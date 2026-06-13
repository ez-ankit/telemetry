(function () {
  'use strict';

  function PageTracker(eventQueue) {
    this._eventQueue = eventQueue;
    this._currentUrl = location.href;
    this._lastTitle = document.title;
    this._init();
  }

  PageTracker.prototype._init = function () {
    this._trackPageView();
    this._patchHistoryAPI();
    this._listenForPopState();
    this._observeTitleChanges();
  };

  PageTracker.prototype._trackPageView = function () {
    this._eventQueue.enqueue('page_view', {
      url: location.href,
      path: location.pathname,
      title: document.title,
      referrer: document.referrer
    });
    this._currentUrl = location.href;
    this._lastTitle = document.title;
  };

  PageTracker.prototype._patchHistoryAPI = function () {
    var self = this;

    var originalPushState = history.pushState;
    history.pushState = function () {
      originalPushState.apply(this, arguments);
      self._checkRouteChange();
    };

    var originalReplaceState = history.replaceState;
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      self._checkRouteChange();
    };
  };

  PageTracker.prototype._listenForPopState = function () {
    var self = this;
    window.addEventListener('popstate', function () {
      self._checkRouteChange();
    });
  };

  PageTracker.prototype._checkRouteChange = function () {
    var currentUrl = location.href;
    var currentTitle = document.title;

    if (currentUrl !== this._currentUrl) {
      this._eventQueue.enqueue('page_view', {
        url: currentUrl,
        path: location.pathname,
        title: currentTitle,
        referrer: this._currentUrl
      });
      this._currentUrl = currentUrl;
      this._lastTitle = currentTitle;
    }
  };

  PageTracker.prototype._observeTitleChanges = function () {
    var self = this;
    var observer = new MutationObserver(function () {
      var title = document.title;
      if (title !== self._lastTitle) {
        self._lastTitle = title;
      }
    });
    var target = document.querySelector('title');
    if (target) {
      observer.observe(target, { childList: true, subtree: true, characterData: true });
    } else {
      observer.observe(document.head || document.documentElement, {
        childList: true,
        subtree: true
      });
    }
  };

  window.PageTracker = PageTracker;
})();
