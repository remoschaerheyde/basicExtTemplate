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
    function TouchService() {
        this.getWidthChange = function (newWidthChange) {
            return this.widthChange;
        };
        this.setWidthChange = function (newWidthChange) {
            console.log('setting width');
            this.widthChange = newWidthChange;
        };
        this.getIndex = function (currentIndex) {
            return this.currentIndex;
        };
        this.setIndex = function (currentIndex) {
            this.currentIndex = currentIndex;
        };
    }
    exports.TouchService = TouchService;
});
//# sourceMappingURL=touch.ser.js.map