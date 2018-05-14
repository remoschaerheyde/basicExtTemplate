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
        function ExampleController(timeout, element, scope, http) {
            console.log('constructor');
        }
        Object.defineProperty(ExampleController.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (v) {
                this._model = v;
                this.modelChanged();
            },
            enumerable: true,
            configurable: true
        });
        ExampleController.prototype.modelChanged = function () {
            console.log('hello');
            var that = this;
            var hyperCubeDef;
            if (that._model) {
                this._model.on("changed", function () {
                    console.log('changed');
                });
                that._model.emit("changed");
            }
        };
        ExampleController.$inject = ["$timeout", "$element", "$scope", "$http"];
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