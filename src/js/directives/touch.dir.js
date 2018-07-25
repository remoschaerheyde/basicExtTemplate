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
    var TouchController = /** @class */ (function () {
        function TouchController(element, scope, attrs, touch) {
            this.element = element;
            this.scope = scope;
            this.attrs = attrs;
            this.touch = touch;
            var that = this;
            that.touchTrack = [];
            element.bind('touchmove', function (event) {
                that.trackToches(event, that);
            });
            element.bind('touchend', function (event) {
                event.preventDefault();
                if (that.touchTrack) {
                    var touchStart = that.touchTrack[0];
                    var touchEnd = that.touchTrack[that.touchTrack.length - 1];
                    var widthChange = touchEnd - touchStart;
                    that.touch.setWidthChange(widthChange);
                    console.log(that);
                    that.touch.setIndex(that.index);
                    that.scope.$apply();
                    that.touchTrack = [];
                }
                else {
                    console.log('no value for touchstart');
                }
            });
        }
        // ============================== injector / Constructor ======================================================
        TouchController.prototype.trackToches = function (event, that) {
            event.preventDefault();
            if (event.touches[0].clientX) {
                that.touchTrack.push(event.touches[0].clientX);
            }
            else {
                console.log('cannot track client value');
            }
        };
        TouchController.$inject = ["$element", "$scope", "$attrs", "£touch"];
        return TouchController;
    }());
    function TouchFactory() {
        "use strict";
        return function ($document, $injector, $registrationProvider) {
            return {
                restrict: "A",
                replace: true,
                controller: TouchController,
                controllerAs: "touchCntrl",
                scope: {},
                bindToController: {
                    index: "=",
                },
                compile: function () { }
            };
        };
    }
    exports.TouchFactory = TouchFactory;
});
//# sourceMappingURL=touch.dir.js.map