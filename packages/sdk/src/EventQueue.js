(function () {
  'use strict';

  function EventQueue(options) {
    this._durableQueue = options.durableQueue;
  }

  EventQueue.prototype.enqueue = function (eventType, payload) {
    return this._durableQueue.enqueue(eventType, payload);
  };

  EventQueue.prototype.flush = function () {
    if (this._durableQueue && this._durableQueue._syncEngine) {
      this._durableQueue._syncEngine.sync();
    }
  };

  EventQueue.prototype.getCounts = function (callback) {
    this._durableQueue.getCounts(callback);
  };

  EventQueue.prototype.destroy = function () {
    this.flush();
  };

  window.EventQueue = EventQueue;
})();
