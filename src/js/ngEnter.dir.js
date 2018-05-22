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
    var enterDirCntrl = /** @class */ (function () {
        function enterDirCntrl(timeout, element, scope) {
            var that = this;
            this.message = "heeloo from enter dir";
            console.log('directive invoked');
        }
        enterDirCntrl.prototype.testFunction = function () {
            console.log('helloooooooo from dir');
        };
        // ============================== injector / Constructor ======================================================
        enterDirCntrl.$inject = ["$timeout", "$element", "$scope"];
        return enterDirCntrl;
    }());
    function ExampleDirectiveFactory2() {
        "use strict";
        return function ($document, $injector, $registrationProvider) {
            return {
                restrict: "A",
                replace: true,
                controller: enterDirCntrl,
                controllerAs: "vm2",
                scope: {},
                bindToController: {
                    model: "<",
                    theme: "<?",
                    editMode: "="
                },
                compile: function () { }
            };
        };
    }
    exports.ExampleDirectiveFactory2 = ExampleDirectiveFactory2;
});
//# sourceMappingURL=ngEnter.dir.js.map