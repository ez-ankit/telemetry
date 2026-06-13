(function () {
  'use strict';

  function ClickTracker(eventQueue) {
    this._eventQueue = eventQueue;
    this._init();
  }

  ClickTracker.prototype._init = function () {
    var self = this;
    var opts = window.AnalyticsUtils.passiveOpts;
    document.addEventListener('click', function (e) {
      self._handleClick(e);
    }, opts);
  };

  ClickTracker.prototype._handleClick = function (e) {
    var target = e.target;
    if (!target) return;

    var el = target.closest('a, button, input, select, textarea, [role="button"], [data-analytics]');
    if (!el) el = target;

    var tagName = (el.tagName || '').toLowerCase();
    if (tagName === 'body' || tagName === 'html' || tagName === 'document') return;

    var payload = {
      tagName: tagName,
      elementId: el.id || '',
      className: (el.className && typeof el.className === 'string') ? el.className : '',
      text: this._getText(el),
      href: this._getHref(el),
      innerText: window.AnalyticsUtils.sanitizeText(el.innerText || el.textContent || '')
    };

    this._eventQueue.enqueue('click', payload);
  };

  ClickTracker.prototype._getText = function (el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      return el.placeholder || el.name || el.type || '';
    }
    var text = '';
    if (el.childNodes && el.childNodes.length > 0) {
      for (var i = 0; i < el.childNodes.length; i++) {
        var node = el.childNodes[i];
        if (node.nodeType === 3) {
          text += node.textContent || '';
        }
      }
    }
    return window.AnalyticsUtils.sanitizeText(text.trim().substring(0, 100));
  };

  ClickTracker.prototype._getHref = function (el) {
    if (el.tagName === 'A') {
      return el.getAttribute('href') || '';
    }
    if (el.tagName === 'AREA') {
      return el.href || '';
    }
    return '';
  };

  window.ClickTracker = ClickTracker;
})();
