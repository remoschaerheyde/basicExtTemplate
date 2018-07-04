// *****************************************************************************
// Dimensions
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
    var dimText = {
        label: function (d) {
            return d.custom.hideDimKeyRegister.text;
        },
        component: "text"
    };
    var customDimensions = {
        uses: "dimensions",
        min: 1
    };
    var keyDimensions = {
        type: "items",
        label: "Key Dimensions",
        items: {
            dimText: dimText,
            dimContainer: {
                type: "items",
                label: "dimensions",
                show: function (d) {
                    return d.custom.hideDimKeyRegister.v === false;
                },
                items: {
                    data_dimensions: customDimensions
                }
            }
        }
    };
    // *****************************************************************************
    // measures
    // *****************************************************************************
    var measures = {
        uses: "measures",
        min: 0
    };
    // *****************************************************************************
    // Appearance 
    // *****************************************************************************
    var modeSettingsSwitch = {
        type: "boolean",
        component: "switch",
        label: "View/Edit Mode",
        ref: "custom.commentEditMode",
        options: [{
                value: true,
                label: "Edit"
            }, {
                value: false,
                label: "View"
            }],
        defaultValue: false
    };
    var appearanceSection = {
        uses: 'settings',
        items: {
            modeSettings: {
                label: "Mode Settings",
                type: "items",
                items: {
                    modeSettingsSwitch: modeSettingsSwitch
                }
            }
        }
    };
    // *****************************************************************************
    // Sorting 
    // *****************************************************************************
    var sorting = {
        uses: 'sorting'
    };
    // *****************************************************************************
    // Ext settings
    // *****************************************************************************
    var keySettingsText = {
        label: "Hiding the 'Key Dimensions' window helps to ensure that users don't accidently add or remove dimensions which are needed in order to connect the comments to the data matrix of the extension.",
        component: "text"
    };
    var testSwitch = {
        type: "boolean",
        component: "switch",
        label: "Hide Key Dimensions",
        ref: "custom.hideDimKeyRegister",
        options: [
            {
                value: { v: false, text: 'Please add the dimensions which you would like to add to your table and which will be associated with your comments' },
                label: "off"
            },
            {
                value: { v: true, text: "Your Key Dimensions are currently hidden. This is a security setting which prevents users from accidently changing the dimension key, which is used to connect your comments to the underlying data matrix the extension is based on. You can disable this setting in this security settings" },
                label: "on"
            },
        ]
    };
    var extSettings = {
        component: "expandable-items",
        label: "Settings",
        items: {
            keySettings: {
                label: "Security",
                type: "items",
                items: {
                    keySettingsText: keySettingsText,
                    testSwitch: testSwitch
                }
            }
        }
    };
    // *****************************************************************************
    // About section
    // *****************************************************************************
    var aboutText = {
        label: "Copyright 2018 Heyde Schweiz AG",
        component: "text"
    };
    var about = {
        type: "items",
        label: 'About',
        items: {
            logo: aboutText
        }
    };
    // =============================================================================
    var extDefinition = {
        type: 'items',
        component: 'accordion',
        items: {
            keyDimensions: keyDimensions,
            measures: measures,
            sorting: sorting,
            appearance: appearanceSection,
            extSettings: extSettings,
            about: about
        }
    };
    exports.default = extDefinition;
});
//# sourceMappingURL=definition.js.map