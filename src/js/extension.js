(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "qvangular", "qlik", "text!../templates/extension.html", "./hyComment.dir", "./ngRegister", "./definition", "./initProps", "./services/touch.ser", "./directives/touch.dir", "./ngRegister", "./qsGeneric"], factory);
    }
})(function (require, exports) {
    "use strict";
    //#region Imports
    var qvangular = require("qvangular");
    var qlik = require("qlik");
    var template = require("text!../templates/extension.html");
    var hyComment_dir_1 = require("./hyComment.dir");
    //import { utils, services } from "../../node_modules/davinci.js/dist/umd/daVinci";
    var ngRegister_1 = require("./ngRegister");
    var definition_1 = require("./definition");
    var initProps_1 = require("./initProps");
    var touch_ser_1 = require("./services/touch.ser");
    var touch_dir_1 = require("./directives/touch.dir");
    var ngRegister_2 = require("./ngRegister");
    var qsGeneric_1 = require("./qsGeneric");
    qvangular.service("$registrationProvider", ngRegister_2.RegistrationProvider).implementObject(qvangular);
    qvangular.service('£touch', touch_ser_1.TouchService);
    // DIRECTIVES ===============================================================================
    ngRegister_1.registerDirective(qvangular, hyComment_dir_1.ExampleDirectiveFactory(), "hyComment");
    ngRegister_1.registerDirective(qvangular, touch_dir_1.TouchFactory(), "ngTouch");
    var $injector = qvangular.$injector;
    var ExampleExtension = /** @class */ (function () {
        function ExampleExtension(model) {
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
                scope.vm = new ExampleExtension(qsGeneric_1.getEnigma(scope));
                scope.touchCntrl = new ExampleExtension(qsGeneric_1.getEnigma(scope));
            }]
    };
});
//# sourceMappingURL=extension.js.map