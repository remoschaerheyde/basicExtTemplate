import { utils } from "../../node_modules/davinci.js/dist/umd/daVinci";
import * as template from "text!../templates/exampleDirective.html";

class ExampleController implements ng.IController {

    private _model: EngineAPI.IGenericObject;
    get model(): EngineAPI.IGenericObject {
        console.log('getter');
        console.log(this._model);
        return this._model;
    }
    set model(value: EngineAPI.IGenericObject) {
        console.log('setter');
        if (value !== this._model) {
            try {
                this._model = value;

                let that = this;
                value.on("changed", function () {
                    console.log('value changed');
                })
                value.emit("changed");

            }
            catch (e) {
                console.error("error", e);
            }
        }
    }
  
    static $inject = ["$timeout", "$element", "$scope", "$http"];

    constructor(timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope, http: ng.IHttpProvider) {
        console.log('heeeeeeeeeeeeeeeeeeeeeeeeeellloooo');
    }
}

export function ExampleDirectiveFactory(): ng.IDirectiveFactory {

    "use strict";
    return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
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
            compile: ():void => {
                console.log("run compile function of Directive");
            }
        };
    };
}