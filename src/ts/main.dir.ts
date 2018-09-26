import * as template from "text!../templates/main.html";
import "./customInterfaces"
import "../scss/main.scss";

class mainDirectiveController implements ng.IController {



  //============================== injector / Constructor ======================================================
  static $inject = ["$http"];

  constructor(private http: ng.IHttpProvider) {
    
 


  }
}


export function mainDirectiveFactory(): ng.IDirectiveFactory {
  "use strict";
  return (
  //  $document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any
  ) => {
    return {
      restrict: "E",
      replace: true,
      template: template,
      controller: mainDirectiveController,
      controllerAs: "vm",
      scope: {},
      bindToController: {
        model: "<",
        theme: "<?",
        editMode: "="
      },
      compile: (): void => {}
    };
  };
}
