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
    var TouchStartController = /** @class */ (function () {
        function TouchStartController(element, scope, touchStart, attrs) {
            this.element = element;
            this.scope = scope;
            this.touchStart = touchStart;
            this.attrs = attrs;
            var that = this;
            element.bind('touchstart', function (event) {
                event.preventDefault();
                var touchStart = event.originalEvent.touches[0].pageX;
                that.touchStart.setTouchStartPosition(touchStart);
                that.touchStart.attachTouchEvent(event);
                that.touchStart.setIndex(that.index);
                // that.ngMousedown(event, index)
            });
        }
        // ============================== injector / Constructor ======================================================
        TouchStartController.$inject = ["$element", "$scope", "£touchStart", "$attrs"];
        return TouchStartController;
    }());
    function TouchStartFactory() {
        "use strict";
        return function ($document, $injector, $registrationProvider) {
            return {
                restrict: "A",
                replace: true,
                controller: TouchStartController,
                controllerAs: "touchStart",
                scope: {},
                bindToController: {
                    index: "=",
                },
                compile: function () { }
            };
        };
    }
    exports.TouchStartFactory = TouchStartFactory;
});
//# sourceMappingURL=touchstart.dir.js.map