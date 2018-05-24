import { utils } from "../../node_modules/davinci.js/dist/umd/daVinci";
import * as template from "text!../templates/pgTest.html";
import "css!../css/hyCommentTbl.css";

interface IQVAngular {
  $injector: angular.auto.IInjectorService;
}

class Comment {
  public dateTime: string = this.getDateTime();
  public usedDimensions: string = this.createDimString();

  private getDateTime(): string {
    let currentdate: Date = new Date();
    return `${currentdate.getDate()}/${currentdate.getMonth() +
      1}/${currentdate.getFullYear()}|${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
  }

  private createDimString(): string {
    let dimString = this.dimensions.map((dim:EngineAPI.INxDimensionInfo) => dim.qGroupFallbackTitles[0]).join('|');
    delete this.dimensions
    return dimString;
  }

  constructor(
    private dimKey: string,
    private author: string,
    private comment: string,
    private dimensions: any,
    private extensionId: string
  ) {}
}

class CommentTblCntrl implements ng.IController {

    private _model: EngineAPI.IGenericObject;
    private _hyperCubeDef: EngineAPI.IGenericObjectProperties;
    private globalObj: any;
    private extCubeWidth: number;
    private cubeWidth:number;
    private cubeWidthWithComments:number;
    private commentColIndex:number;
    private user: string;
    private stringSeperator:string = '|';


  private _editMode: boolean;
  get editMode() {
    return this._editMode;
  }
  set editMode(v: boolean) {
    this._editMode = v;
  }

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
    let comments =  customHyperCubeLayout.qHyperCube.hyRowKeys
    this.http({
      url: "http://localhost:5000/api/comments/get_all",
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
    }).catch(err => {
      console.log('no comments from api received');
      this.setData(customHyperCubeLayout.qHyperCube)
    })
  }

  private setData(hyperCube: EngineAPI.IHyperCube) {

    let that:any = this;
    if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {

    this.cubeWidth =  hyperCube.qDimensionInfo.length + (hyperCube.qMeasureInfo as any).length  
    if((hyperCube as any).hyComments) {

        this._matrixData = hyperCube.qDataPages[0].qMatrix;
        this.cubeWidthWithComments = this.cubeWidth + 1;
        this.commentColIndex = this.cubeWidth;

        this._matrixData.forEach((row:any) => row.push({qText: "", qState:"L"}));
      (hyperCube as any).hyComments.forEach(comment => {
        (this._matrixData[comment.tableRowIndex] as any).splice(-1,1);
        (this._matrixData[comment.tableRowIndex] as any).push({qText: comment.comment , qState:"L"})
      });
    }
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

          rowKeys = genHyperCubeLayout.qHyperCube.qDataPages[0].qMatrix.map((row:any, rowIndex) => {
              return {tableRowKey: this.createDimKey(row), tableRowIndex: rowIndex };
          });
            
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

  private createDimKey(row:EngineAPI.INxCellRows):string {
   
    return (row as any).filter(col => col.qState !== "L").map(cell => cell.qText).join(this.stringSeperator)
  }

  private addOrUpdateComment = function(row:EngineAPI.INxCellRows) {

    let newComment = new Comment(this.createDimKey(row), this.user, this.textAreaComment, this._dimensionsInfo, this._model.id)

    this.http({
      url: "http://localhost:5000/api/comments/add_new_comment",
      method: "POST",
      data: { newComment: JSON.stringify(newComment) },
      headers: { "Content-Type": "application/json" }
    }).then(res => {
    
        this._model.emit("changed");
      }).catch(err => {
        console.log(err);
      })

    this.textAreaComment = "";
  }

    private deleteComment = function(row:EngineAPI.INxCellRows) { 

      let dimKey:string = this.createDimKey(row);

      let commentToDelete = {dimKey: dimKey}

      this.http({
        url: "http://localhost:5000/api/comments/delete_comment",
        method: "POST",
        data: {dimKey: JSON.stringify(dimKey) },
        headers: { "Content-Type": "application/json" }
      }).then(res => {
          this._model.emit("changed");
        })
    }

  // ============================== injector / Constructor ======================================================
  static $inject = ["$timeout", "$element", "$scope", "$http"];

  constructor(timeout: ng.ITimeoutService, element: JQuery, scope: ng.IScope, private http: ng.IHttpProvider) {
    const that: any = this;
    
    // GLOBAL OBJECT
    this.globalObj = that._model.session.app.global;

    // GET AUTHENTICATED USER
    this.globalObj.getAuthenticatedUser().then(user => (this.user = user));

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
