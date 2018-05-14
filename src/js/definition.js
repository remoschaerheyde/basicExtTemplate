// *****************************************************************************
// Dimensions & Measures
// *****************************************************************************
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
    var dimensions = {
        uses: 'dimensions',
        min: 1,
    };
    var measures = {
        uses: 'measures',
        min: 0,
    };
    // *****************************************************************************
    // Appearance section
    // *****************************************************************************
    var appearanceSection = {
        uses: 'settings'
    };
    // =============================================================================
    var extDefinition = {
        type: 'items',
        component: 'accordion',
        items: {
            dimensions: dimensions,
            measures: measures,
            appearance: appearanceSection
        }
    };
    exports.default = extDefinition;
});
//# sourceMappingURL=definition.js.map