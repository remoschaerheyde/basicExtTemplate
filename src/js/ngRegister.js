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
    function registerDirective(dirRegister, dirFactory, directiveName) {
        var injector = dirRegister.$injector;
        try {
            if (!injector.has(directiveName + "Directive")) {
                console.log('registring directive as:', directiveName);
                dirRegister.directive(directiveName, dirFactory);
            }
        }
        catch (err) {
            console.log("Error in checkForExistingDirective", err);
        }
    }
    exports.registerDirective = registerDirective;
    var RegistrationProvider = /** @class */ (function () {
        function RegistrationProvider() {
        }
        //#endregion
        RegistrationProvider.prototype.implementObject = function (object) {
            this.directive = object.directive ? object.directive : null;
            this.filter = object.filter ? object.filter : null;
            this.service = object.service ? object.service : null;
        };
        return RegistrationProvider;
    }());
    exports.RegistrationProvider = RegistrationProvider;
});
//# sourceMappingURL=ngRegister.js.map