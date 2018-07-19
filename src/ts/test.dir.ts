import * as template from "text!../templates/test.html";
import "./customInterfaces"
import {Comment} from './commentClass';



class CommentTblCntrl implements ng.IController {



  // ============================== injector / Constructor ======================================================
  static $inject = ["$timeout", "$element", "$scope", "$http"];

  constructor(timeout: ng.ITimeoutService, private element: JQuery, private scope: ng.IScope, private http: ng.IHttpProvider) {

    console.log('directive');
    console.log(this);
   

    console.log('hello from dir');
 




  }
}

export function ExampleDirectiveFactory2(): ng.IDirectiveFactory {
  "use strict";
  return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
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
      compile: (): void => {}
    };
  };
}
