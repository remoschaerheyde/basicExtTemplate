(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function TouchStartService() {
        this.touchStartPosition;
        this.index;
        this.setTouchStartPosition = function (newPosition) {
            this.touchStartPosition = newPosition;
        };
        this.getTouchStartPosition = function () {
            return this.touchStartPosition;
        };
        this.attachTouchEvent = function (event) {
            this.touchStartEvent = event;
        };
        this.setIndex = function (index) {
            this.index = index;
        };
    }
    exports.TouchStartService = TouchStartService;
});
//# sourceMappingURL=touchStart.ser.js.map