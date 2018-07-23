//#region Imports
import * as qvangular from "qvangular";
import * as qlik from "qlik";
import * as template from "text!../templates/extension.html";
import { ExampleDirectiveFactory } from "./pgTest.dir";
import { ExampleDirectiveFactory2 } from "./test.dir";
import { utils, services } from "../../node_modules/davinci.js/dist/umd/daVinci";
import {registerDirective} from "./ngRegister";
import extDefinition from "./definition";
import initProps from "./initProps";

qvangular.service<services.IRegistrationProvider>("$registrationProvider", services.RegistrationProvider).implementObject(qvangular);

registerDirective(qvangular, ExampleDirectiveFactory(), "pgTest")
registerDirective(qvangular, ExampleDirectiveFactory2(), "test")


class ExampleExtension {

    model: EngineAPI.IGenericObject;

    constructor(model: EngineAPI.IGenericObject) {
        this.model = model;
    }

    public isEditMode() {
        if (qlik.navigation.getMode() === "analysis") {
            return false;
        } else {
            return true;
        }
    }
}

export = {
    definition: extDefinition,
    initialProperties: initProps,
    template: template,
    controller: ["$scope", function (scope: utils.IVMScope<ExampleExtension>) {
        scope.vm = new ExampleExtension(utils.getEnigma(scope));
        (scope as any).vm2 = new ExampleExtension(utils.getEnigma(scope));

    }]
};


