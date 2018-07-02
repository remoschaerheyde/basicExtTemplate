interface IQVAngular {
    $injector: angular.auto.IInjectorService;
  }
  
  interface ElementSize {
    height: number,
    width: number
  }
  
  interface commentRow {
    comment:string;
    tableRowIndex: number;
  }
  
  
  interface customHyperCube extends EngineAPI.IHyperCube {
    hyComments:[commentRow]
  }
  
  