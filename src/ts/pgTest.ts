import { utils } from "../../node_modules/davinci.js/dist/umd/daVinci";
import * as template from "text!../templates/pgTest.html";
import "css!../css/hyCommentTbl.css";

interface IQVAngular {
  $injector: angular.auto.IInjectorService;
}

class Comment {
  public _dateTime: string = this.dateTime();

  private dateTime(): string {
    let currentdate: Date = new Date();
    return `${currentdate.getDate()}/${currentdate.getMonth() +
      1}/${currentdate.getFullYear()}|${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
  }
  constructor(
    private dimKey: string,
    private author: string,
    private comment: string,
    private dimensions: string
  ) {}
}

class CommentTblCntrl implements ng.IController {
  private _model: EngineAPI.IGenericObject;
  private _hyperCubeDef: EngineAPI.IGenericObjectProperties;
  private globalObj: any;
  private extId: string;
  private extCubeWidth: number;
  private cubeWidth:number;

  private _editMode: boolean;
  get editMode() {
    return this._editMode;
  }
  set editMode(v: boolean) {
    this._editMode = v;
  }

  private commentSeparator: string = "|#£?|";

  // Model ==================================================================================

  get model(): EngineAPI.IGenericObject {
    return this._model;
  }
  set model(v: EngineAPI.IGenericObject) {
    this._model = v;
    this.modelChanged();
  }

  private modelChanged() {
    let that = this;
    let hyperCubeDef: EngineAPI.IGenericObjectProperties;

    if (that._model) {
      that._model.on("changed", function() {
        // ========== Creating dynamic hypercube ==========//
        that._model
          .getProperties()
          .then((sessionObjProps: EngineAPI.IGenericObjectProperties) => {
            hyperCubeDef = sessionObjProps.qHyperCubeDef;
            
            that.extCubeWidth = sessionObjProps.qHyperCubeDef.qDimensions.length + sessionObjProps.qHyperCubeDef.qMeasures.length;

            let nxPage: EngineAPI.INxPage = {
              qLeft: 0,
              qTop: 0,
              qWidth: that.extCubeWidth,
              qHeight: 200
            };
            hyperCubeDef.qInitialDataFetch = [nxPage];
            that._hyperCubeDef = hyperCubeDef;
          })
          .then(() => that.destroySessionObject())
          .then(() => that.createSessionObject());
      });
      that._model.emit("changed");
    }
  }

  // ================== Set the data of the session object ================================//

  private _matrixData: EngineAPI.INxCellRows[];

  private _dimensionsInfo: any;
  private _genericObjectId: string;
  public get dimensionsInfo(): any {
    return this._dimensionsInfo;
  }

  private _measureInfo: any;
  public get measureInfo(): any {
    return this._measureInfo;
  }

  private _data: any;

  private _maxY: number;
  public get maxY(): number {
    return this._maxY;
  }
  public set maxY(v: number) {
    this._maxY = v;
  }

  private getDbComments = function(customHyperCubeLayout) {
    console.log('get comments from db');
    let comments =  customHyperCubeLayout.qHyperCube.hyRowKeys

    this.http({
      url: "http://localhost:5000",
      method: "POST",
      data: { comments: JSON.stringify(comments) },
      headers: { "Content-Type": "application/json" }
    }).then(res => {
   
        this._model.app.getObject(this._genericObjectId).then((sessionObj:EngineAPI.IGenericObjectProperties) => {

          sessionObj.getProperties().then(sessionObjProps => {
            sessionObjProps.qHyperCubeDef.hyComments = res.data
            sessionObj.setProperties(sessionObjProps).then(() => {
              sessionObj.getLayout().then(newCubeLayoutWithComments => {
                
                this.setData(newCubeLayoutWithComments.qHyperCube);
                
              })
            })
          })  
        })

    }).catch(err => console.log('could not get comment data from api'))
  }

  private setData(hyperCube: EngineAPI.IHyperCube) {
    // set Hypercube Matrix Data
   
    let that:any = this;
            if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {

              // determine cube width
              this.cubeWidth =  hyperCube.qDimensionInfo.length + (hyperCube.qMeasureInfo as any).length
            

              hyperCube.qDataPages[0].qMatrix.forEach((row:any) => row.push({qText: ""}));
                // add comment field

              (hyperCube as any).hyComments.forEach(comment => {
                  (hyperCube.qDataPages[0].qMatrix[comment.tableRowIndex] as any).splice(-1,1);
                  (hyperCube.qDataPages[0].qMatrix[comment.tableRowIndex] as any).push({qText: comment.comment})
              });

              this._matrixData = hyperCube.qDataPages[0].qMatrix;
              
              } else {
                this._matrixData = [];
              }

          

              // set Dimension Information
              if (hyperCube.qDimensionInfo && hyperCube.qDimensionInfo.length > 0) {
                this._dimensionsInfo = hyperCube.qDimensionInfo;
              } else {
                this._dimensionsInfo = [];
              }
          
              // set Measure Information
              if (hyperCube.qMeasureInfo && (hyperCube.qMeasureInfo as any).length > 0) {
                this._measureInfo = hyperCube.qMeasureInfo;
                this.maxY = hyperCube.qMeasureInfo[0].qMax;
              } else {
                this.maxY = 0;
              }
  }
  // =================== Destory session object ============================================= //
  
  private destroySessionObject() {
    let that = this;
    if (that._genericObjectId !== undefined) {
      // destroy session object
      that.model.app
        .destroySessionObject(that._genericObjectId)
        .then((result: any) => {
          // nothing to do
        });
    }
  }

  // =================== Create session object ============================================= //

  private createSessionObject() {
    let that = this;

    let hyperCubeProp: EngineAPI.IGenericObjectProperties = {
      qInfo: {qId: "",qType: "HyperCube"},
      qHyperCubeDef: this._hyperCubeDef
    };

    this._model.app
      .createObject(hyperCubeProp)
      .then((genericObject: EngineAPI.IGenericObject) => {
        this._genericObjectId = genericObject.id;
      
        let rowKeys;
          genericObject.getLayout().then((genHyperCubeLayout: EngineAPI.IGenericHyperCubeLayout) => {
              console.log(genHyperCubeLayout);
              rowKeys = genHyperCubeLayout.qHyperCube.qDataPages[0].qMatrix.map((row:any, rowIndex) => {
              return {tableRowKey: row.map(rowItem => rowItem.qText).join('|'), tableRowIndex: rowIndex };
            })
          }).then(() => {
            genericObject.getProperties().then((genObjProps:EngineAPI.IGenericObjectProperties) => {
              genObjProps.qHyperCubeDef.hyRowKeys = rowKeys;
              genericObject.setProperties(genObjProps).then(() => {
                genericObject.getLayout().then((customHyperCubeLayout: EngineAPI.IGenericHyperCubeLayout) => {
              
                    that.getDbComments(customHyperCubeLayout)
                    
                 })
              })
            })
          })
      });
  }

  // CREATE DIMENSION KEY ===================================================================================


  private _tblRowSelected;
  private getRowIndex(row, index) {
    this._tblRowSelected = index;

    console.log(index);
    
  }



  // GET COMMENTS ============================================================================================

  private getSelectedComments = function() {
    if (this._keySelectedComment) {
      let key: string = this._keySelectedComment;

      this.http({
        url: "http://localhost:4000/comments/getcomment",
        method: "POST",
        data: { key: key },
        headers: { "Content-Type": "application/json" }
      }).then(res => {
        console.log(res);
      });
    }
  };

  // POST COMMENT ============================================================================================



  private postComment = function() {
      

      console.log('posting comment');
      this.http({
        url: "http://localhost:5000",
        method: "POST",
        data: { comment: 'hello' },
        headers: { "Content-Type": "application/json" }
      }).then(res => {
        console.log("Comment succesfully added");
        
      });
  };

  // ============================ Retrieving comments =================

  private getAllComments = function() {
    this.http({
      url: "http://localhost:4000/comments/getAll",
      method: "GET"
    }).then(comments => {
      console.log(comments);
    });
  };

  // =======================================================================

  private clearDb = function() {
    this.http({
      url: "http://localhost:4000/comments/clearDb",
      method: "GET"
    }).then(res => {
      console.log(res);
    });
  };


  // ============================== injector / Constructor ======================================================
  static $inject = ["$timeout", "$element", "$scope", "$http"];

  constructor(timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope, private http: ng.IHttpProvider, private _user: string) {
    const that: any = this;

    this.globalObj = that._model.session.app.global;

    this.extId = this._model.id;

    this.globalObj.getAuthenticatedUser().then(user => (this._user = user));

    scope.$on("$destroy", function() {
      that.destroySessionObject();
    });
  }
}

export function ExampleDirectiveFactory(): ng.IDirectiveFactory {
  "use strict";
  return ($document: ng.IAugmentedJQuery, $injector: ng.auto.IInjectorService, $registrationProvider: any) => {
    return {
      restrict: "E",
      replace: true,
      template: template,
      controller: CommentTblCntrl,
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
