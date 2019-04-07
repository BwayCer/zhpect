'use strict';


let EventIntervalManager = function () {
    function EventIntervalManager(evtName, intervalTimeMs, forceTimeMs) {
        this._intervalTimeMs = intervalTimeMs > 0 ? intervalTimeMs : 99;
        this._forceTimeMs = forceTimeMs > 0 ? forceTimeMs : this._intervalTimeMs;
        this._prevStamp = 0;
        this._timerId = null;
        this.emitList = [];

        let tmp = function tmp(evt) {
            let self = tmp.self;
            let now = new Date();

            if (self._timerId !== null) {
                clearTimeout(self._timerId);
            }
            if (now - self._prevStamp > self._forceTimeMs) {
                self.emitScroll(self, this, evt);
            }

            self._timerId = setTimeout(
                self.emitScroll,
                self._intervalTimeMs,
                self, this, evt
            );
        };
        tmp.self = this;

        window.addEventListener(evtName, tmp, false);
    }

    EventIntervalManager.prototype.emitScroll = function emitScroll(self, evtSelf, evt) {
        self._timerId = null;
        self._prevStamp = new Date();
        self.emitList.forEach(function (fnItem) {
            fnItem.call(evtSelf, evt);
        });
    };

    EventIntervalManager.prototype.add = function () {
        let self = this;
        Array.from(arguments).forEach(function (fnItem) {
            if (self.emitList.indexOf(fnItem) === -1) {
                self.emitList.push(fnItem);
            }
        });
    };

    EventIntervalManager.prototype.remove = function () {
        let self = this;
        Array.from(arguments).forEach(function (fnItem) {
            let idx = self.emitList.indexOf(fnItem);
            if (idx !== -1) return;
            self.emitList.splice(idx, 1);
        });
    };

    return EventIntervalManager;
}();

