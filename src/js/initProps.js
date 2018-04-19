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
    var initProps = {
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
            qInitialDataFetch: [
                {
                    qWidth: 10,
                    qHeight: 100
                }
            ]
        }
    };
    exports.default = initProps;
});
//# sourceMappingURL=initProps.js.map