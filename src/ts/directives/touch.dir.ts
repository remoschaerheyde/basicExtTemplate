class TouchController implements ng.IController {

    private touchTrack:number[];
    private widthChange: number;    
    private index:number;

    // ============================== injector / Constructor ======================================================

    private trackToches(event,that) {
        event.preventDefault();
        if(event.touches[0].clientX) {
            that.touchTrack.push(event.touches[0].clientX)
        } else {
            console.log('cannot track client value');
        }
    }



    static $inject = ["$element", "$scope", "$attrs", "£touch"];
  
    constructor(private element: JQuery, private scope: ng.IScope, private attrs:any, private touch:any) {


        let that = this;

        that.touchTrack = [];

        element.bind('touchmove', function(event:any) {
            that.trackToches(event,that)

        })


        element.bind('touchend', function(event:any) {
            event.preventDefault();

            if(that.touchTrack) {       
                let touchStart = that.touchTrack[0]
                let touchEnd = that.touchTrack[that.touchTrack.length -1]

                let widthChange =  touchEnd - touchStart

                that.touch.setWidthChange(widthChange)
                console.log(that);
                that.touch.setIndex(that.index)
                that.scope.$apply();

                that.touchTrack = [];

            } else {
                console.log('no value for touchstart');
            }


        })



     
    }
  }
  
  export function TouchFactory(): ng.IDirectiveFactory {
    "use strict";
    return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
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
  
  
  
  