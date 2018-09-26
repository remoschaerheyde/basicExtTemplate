class TouchController implements ng.IController {



    // ============================== injector / Constructor ======================================================


    static $inject = ["$element", "$scope", "$attrs"];
  
    constructor(private element: JQuery, private scope: ng.IScope, private attrs:any) {


   

    }
  }
  
  export function TouchFactory(): ng.IDirectiveFactory {
    "use strict";
    return (
    //    $document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any
    ) => {
      return {
        restrict: "A",
        replace: true,
        controller: TouchController,
        controllerAs: "touchCntrl",
        scope: {},
        bindToController: {
          index: "=",
        },
        compile: (): void => {}
      };
    };
  }
  
  
  
  