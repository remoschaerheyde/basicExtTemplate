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
        this.touchStartPosition = 5;
        this.setTouchStartPosition = function (newPosition) {
            console.log(newPosition);
            this.touchStartPosition = newPosition;
        };
        this.getTouchStartPosition = function () {
            return this.touchStartPosition;
        };
    }
    exports.TouchStartService = TouchStartService;
});
//# sourceMappingURL=testService.js.map