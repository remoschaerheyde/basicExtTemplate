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
    function getEnigma(scope) {
        var enigmaRoot = undefined;
        try {
            var anyscope = scope;
            if (anyscope && anyscope.component && anyscope.component.model) {
                if (anyscope.component.model.enigmaModel) {
                    enigmaRoot = anyscope.component.model.enigmaModel;
                }
                else {
                    enigmaRoot = anyscope.component.model;
                }
            }
        }
        catch (error) {
            console.log("Could not get Enigma", error);
        }
        return enigmaRoot;
    }
    exports.getEnigma = getEnigma;
});
//# sourceMappingURL=qsGeneric.js.map