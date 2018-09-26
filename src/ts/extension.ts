import * as qvangular from "qvangular";
import * as qlik from "qlik";
import * as template from "text!../templates/extension.html";
import {mainDirectiveFactory} from "./main.dir";
import {registerDirective} from "./ngRegister";
import extDefinition from "./definition";
import initProps from "./initProps";
//import {CustomService} from "./services/custom.ser";
//import {CustomFactory} from "./directives/custom.dir";
import {RegistrationProvider,IRegistrationProvider} from "./ngRegister";
import {getEnigma} from "./qsGeneric";

// SERVICE REGISTRATION ===============================================================================
qvangular.service<IRegistrationProvider>("$registrationProvider", RegistrationProvider).implementObject(qvangular);
//qvangular.service<IRegistrationProvider>('£custom',CustomService);

// DIRECTIVE REGISTRATION ===============================================================================
registerDirective(qvangular, mainDirectiveFactory(), "hySensorExtension")
//registerDirective(qvangular, CustomFactory(), "ngCustom")

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
