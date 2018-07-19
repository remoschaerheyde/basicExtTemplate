(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "text!../templates/test.html", "./customInterfaces"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var template = require("text!../templates/test.html");
    require("./customInterfaces");
    var CommentTblCntrl = /** @class */ (function () {
        function CommentTblCntrl(timeout, element, scope, http) {
            this.element = element;
            this.scope = scope;
            this.http = http;
            console.log('directive');
            console.log(this);
            console.log('hello from dir');
        }
        // ============================== injector / Constructor ======================================================
        CommentTblCntrl.$inject = ["$timeout", "$element", "$scope", "$http"];
        return CommentTblCntrl;
    }());
    function ExampleDirectiveFactory2() {
        "use strict";
        return function ($document, $injector, $registrationProvider) {
            return {
                restrict: "E",
                replace: true,
                template: template,
                controller: CommentTblCntrl,
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
//# sourceMappingURL=test.dir.js.map