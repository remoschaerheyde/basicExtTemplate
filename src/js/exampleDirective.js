(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "text!../templates/exampleDirective.html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var template = require("text!../templates/exampleDirective.html");
    var ExampleController = /** @class */ (function () {
        function ExampleController(timeout, element, scope) {
            this.test = 'heeeelloooo';
            console.log("run constructor of Directive Controller");
        }
        Object.defineProperty(ExampleController.prototype, "model", {
            get: function () {
                console.log('getter');
                console.log(this._model);
                return this._model;
            },
            set: function (value) {
                console.log('setter');
                if (value !== this._model) {
                    try {
                        this._model = value;
                        var that = this;
                        value.on("changed", function () {
                            console.log('value changed');
                        });
                        value.emit("changed");
                    }
                    catch (e) {
                        console.error("error", e);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        ExampleController.$inject = ["$timeout", "$element", "$scope"];
        return ExampleController;
    }());
    function ExampleDirectiveFactory() {
        "use strict";
        return function ($document, $injector, $registrationProvider) {
            return {
                restrict: "E",
                replace: true,
                template: template,
                controller: ExampleController,
                controllerAs: "vm",
                scope: {},
                bindToController: {
                    model: "<",
                    theme: "<?",
                    editMode: "<?"
                },
                compile: function () {
                    console.log("run compile function of Directive");
                }
            };
        };
    }
    exports.ExampleDirectiveFactory = ExampleDirectiveFactory;
});
//# sourceMappingURL=exampleDirective.js.map