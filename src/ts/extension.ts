import * as qvangular from "qvangular";
import * as qlik from "qlik";
import * as template from "text!../templates/extension.html";
import { CommentDirectiveFactory } from "./hyComment.dir";
import {registerDirective} from "./ngRegister";
import extDefinition from "./definition";
import initProps from "./initProps";
import {TouchService} from "./services/touch.ser";
import {TouchFactory} from "./directives/touch.dir";
import {RegistrationProvider,IRegistrationProvider} from "./ngRegister";
import {getEnigma} from "./qsGeneric";

// SERVICE REGISTRATION ===============================================================================
qvangular.service<IRegistrationProvider>("$registrationProvider", RegistrationProvider).implementObject(qvangular);
qvangular.service<IRegistrationProvider>('£touch',TouchService);

// DIRECTIVE REGISTRATION ===============================================================================
registerDirective(qvangular, CommentDirectiveFactory(), "hyComment")
registerDirective(qvangular, TouchFactory(), "ngTouch")

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
    controller: ["$scope", function (scope:any) {
        scope.vm = new ExampleExtension(getEnigma(scope));
        (scope as any).touchCntrl = new ExampleExtension(getEnigma(scope));
    }]
};
