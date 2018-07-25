class TouchStartController implements ng.IController {

  private touchStartPosition:number;
  private vm:any;


  // ============================== injector / Constructor ======================================================
  static $inject = ["$element", "$scope", "£touchStart", "$attrs"];

  
  constructor(private element: JQuery, private scope: ng.IScope, private touchStart:any, private attrs:any) {

   
    let that:any = this;

    element.bind('touchstart', function(event) {
      event.preventDefault();
      let touchStart = (event.originalEvent as any).touches[0].pageX;
      that.touchStart.setTouchStartPosition(touchStart);
      that.touchStart.attachTouchEvent(event);
      that.touchStart.setIndex(that.index)

     // that.ngMousedown(event, index)
    });
  }
}

export function TouchStartFactory(): ng.IDirectiveFactory {
  "use strict";
  return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
    return {
      restrict: "A",
      replace: true,
      controller: TouchStartController,
      controllerAs: "touchStart",
      scope: {},
      bindToController: {
        index: "=",
      },
      compile: (): void => {}
    };
  };
}



