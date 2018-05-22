(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "qvangular", "qlik", "text!../templates/extension.html", "./pgTest.dir", "../../node_modules/davinci.js/dist/umd/daVinci", "./ngRegister", "./definition", "./initProps"], factory);
    }
})(function (require, exports) {
    "use strict";
    //#region Imports
    var qvangular = require("qvangular");
    var qlik = require("qlik");
    var template = require("text!../templates/extension.html");
    var pgTest_dir_1 = require("./pgTest.dir");
    var daVinci_1 = require("../../node_modules/davinci.js/dist/umd/daVinci");
    var ngRegister_1 = require("./ngRegister");
    var definition_1 = require("./definition");
    var initProps_1 = require("./initProps");
    qvangular.service("$registrationProvider", daVinci_1.services.RegistrationProvider).implementObject(qvangular);
    ngRegister_1.registerDirective(qvangular, pgTest_dir_1.ExampleDirectiveFactory(), "pgTest");
    var ExampleExtension = /** @class */ (function () {
        function ExampleExtension(model) {
            console.log("constructor of ExampleExtension");
            this.model = model;
        }
        ExampleExtension.prototype.isEditMode = function () {
            if (qlik.navigation.getMode() === "analysis") {
                return false;
            }
            else {
                return true;
            }
        };
        return ExampleExtension;
    }());
    return {
        definition: definition_1.default,
        initialProperties: initProps_1.default,
        template: template,
        controller: ["$scope", function (scope) {
                console.log("run controller of Extension");
                scope.vm = new ExampleExtension(daVinci_1.utils.getEnigma(scope));
            }]
    };
});
//# sourceMappingURL=extension.js.map