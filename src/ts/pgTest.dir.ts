import * as template from "text!../templates/pgTest.html";
import "css!../css/main.css";
import "./customInterfaces"
import {Comment} from './commentClass';



class CommentTblCntrl implements ng.IController {

  private _model: EngineAPI.IGenericObject;
  private _hyperCubeDef: EngineAPI.IGenericObjectProperties;
  private globalObj: any;
  private extCubeWidth: number;
  private cubeWidthWithComments:number;
  private commentColIndex:number;
  private user: string;
  private stringSeperator:string = '|';
  private showEditForCell: number;
  private _matrixData:EngineAPI.INxCellRows[];
  private textAreaComment:string;
  private _dimensionsInfo: any;
  private _genericObjectId: string;
  private apiCommentRoute:string = 'http://localhost:5000/api/comments/';
  private tblHeaderHeight: number;
  private tblBodyHeight: number;
  private tblFooterHeight: number;
  private commentColWidth:number;
  private _tblCols: {headerTitle: string, type:string, colWidth: number}[]

  public get dimensionsInfo(): any {
    return this._dimensionsInfo;
  }
  
  private _measureInfo: any;
  public get measureInfo(): any {
    return this._measureInfo;
  }
  
  private _maxY: number;
  public get maxY(): number {
    return this._maxY;
  }
  public set maxY(v: number) {
    this._maxY = v;
  }

  private _editMode: boolean;
  get editMode() {
    return this._editMode;
  }

  set editMode(v: boolean) {
    this._editMode = v;
  }

  get model(): EngineAPI.IGenericObject {
    return this._model;
  }
  set model(v: EngineAPI.IGenericObject) {
    this._model = v;
  this.modelChanged();
  }

  // Model ==================================================================================

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
          .then(() => that.createSessionObject())
          .then(() => that.initGuiVars())
      });
      that._model.emit("changed");
    }
  }

  // ================== Set the data of the session object ================================//
  private getDbComments = function(customHyperCubeLayout) {
    let comments =  customHyperCubeLayout.qHyperCube.hyRowKeys
    this.http({
      url: this.apiCommentRoute + "get_all",
      method: "POST",
      data: { comments: JSON.stringify(comments) },
      headers: { "Content-Type": "application/json" }
    }).then(res => {
        this._model.app.getObject(this._genericObjectId).then((sessionObj:EngineAPI.IGenericObjectProperties) => {
          sessionObj.getProperties().then((sessionObjProps:EngineAPI.IGenericObjectProperties) => {
            sessionObjProps.qHyperCubeDef.hyComments = res.data;
            sessionObj.setProperties(sessionObjProps).then(() => {
              sessionObj.getLayout().then((newCubeLayoutWithComments: EngineAPI.IGenericHyperCubeLayout) => {
                this.setData(newCubeLayoutWithComments.qHyperCube);
              }).catch(err =>  console.log('could not get customised hypercube layout', err))
            }).catch(err =>  console.log('could not set custom cube properties', err))
          }).catch(err =>  console.log('could not get generic object properties', err))
        }).catch(err =>  console.log('could not get generic object', err))
    }).catch(err => {
      console.log('no comments from api received');
      this.setData(customHyperCubeLayout.qHyperCube)
    })
  }

  private setData(hyperCube: customHyperCube) {
    try {
      if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {
        this._matrixData = hyperCube.qDataPages[0].qMatrix;
        this._matrixData.forEach((row:any) => row.push({qText: "", qState:"L"}));
        this.cubeWidthWithComments = this.extCubeWidth + 1;
        this.commentColIndex = this.extCubeWidth;
    
        if(hyperCube.hyComments) {
            hyperCube.hyComments.forEach((comment:commentRow) => {
              (this._matrixData[comment.tableRowIndex] as any).splice(-1,1);
              (this._matrixData[comment.tableRowIndex] as any).push({qText: comment.comment , qState:"L"})
            });
          }
        } else {
        this._matrixData = [];
        }


        this._tblCols = [];
        // set Header Dimension Titles ===============================================================
        if (hyperCube.qDimensionInfo && hyperCube.qDimensionInfo.length > 0) {
          this._dimensionsInfo = hyperCube.qDimensionInfo;

          console.log(this._dimensionsInfo);
          hyperCube.qDimensionInfo.forEach(dimInfo => {
            this._tblCols.push({headerTitle: dimInfo.qGroupFallbackTitles[0], type: 'D', colWidth: 200})

          })
        } else {
          this._dimensionsInfo = [];
        }
        // set Header Measure Titles ====================================================================
        if (hyperCube.qMeasureInfo && (hyperCube.qMeasureInfo as any).length > 0) {
          this._measureInfo = hyperCube.qMeasureInfo;
          this.maxY = hyperCube.qMeasureInfo[0].qMax;

          (hyperCube.qMeasureInfo as any).forEach(measureInfo => {
            this._tblCols.push({headerTitle: measureInfo.qFallbackTitle, type: 'M', colWidth: 200})
          })

        } else {
          this.maxY = 0;
        }
        // set Header Comment Titles =======================================================================

        this._tblCols.push({headerTitle: 'Comments', type: 'comment', colWidth: 400})
        

    } catch(err) {
      console.log('could not set data', err);
    }
  }

  
  // =================== Destory session object ============================================= //
  private destroySessionObject() {
    let that = this;
    if (that._genericObjectId !== undefined) {
      // destroy session object
      that.model.app.destroySessionObject(that._genericObjectId)
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
      
        let rowKeys:{tableRowKey:string, tableRowIndex:number}[];

        genericObject.getLayout().then((genHyperCubeLayout: EngineAPI.IGenericHyperCubeLayout) => {
          rowKeys = genHyperCubeLayout.qHyperCube.qDataPages[0].qMatrix.map((row:any, rowIndex:number) => {
              return {tableRowKey: this.createDimKey(row), tableRowIndex: rowIndex };
          });
          }).then(() => {
            genericObject.getProperties().then((genObjProps:EngineAPI.IGenericObjectProperties) => {
              genObjProps.qHyperCubeDef.hyRowKeys = rowKeys;
              genericObject.setProperties(genObjProps).then(() => {
                genericObject.getLayout().then((customHyperCubeLayout: EngineAPI.IGenericHyperCubeLayout) => {
                    that.getDbComments(customHyperCubeLayout)
                }).catch(err => console.log('could not get the custom hypercube layout of the session object', err))
              }).catch(err => console.log('could not set session object hypercube properties with rowkeys', err))
            }).catch(err => console.log('could not get generic object properties of session object', err))
          }).catch(err => console.log('could not get the generic hypercube layout of the session object', err))
      }).catch(err => console.log('could not create session object', err));
    }
  private createDimKey(row:EngineAPI.INxCellRows):string {
    return (row as any).filter(col => col.qState !== "L").map(cell => cell.qText).join(this.stringSeperator)
  }

  // ================== API CALLS =======================================//
  private addOrUpdateComment = function(row:EngineAPI.INxCellRows) {
    let newComment = new Comment(this.createDimKey(row), this.user, this.textAreaComment, this._dimensionsInfo, this._model.id)

    this.http({
      url: this.apiCommentRoute +  "add_new_comment",
      method: "POST",
      data: { newComment: JSON.stringify(newComment) },
      headers: { "Content-Type": "application/json" }
    }).then(res => this._model.emit("changed")
    ).catch(err => console.log('could not add new comment',err))
  }

  private deleteComment = function(row:EngineAPI.INxCellRows) { 
    let dimKey:string = this.createDimKey(row);
    this.http({
      url: this.apiCommentRoute + "delete_comment",
      method: "POST",
      data: {dimKey: JSON.stringify(dimKey) },
      headers: { "Content-Type": "application/json" }
    }).then(res => this._model.emit("changed")
    ).catch(err => console.log('could not delete comment',err))
  }

    // ================== GUI RELATED FUNCTIONS =======================================//

  private getSize(): ElementSize {
    return {
          height: this.element.height(),
          width: this.element.width()
      };
    }

    private calcCommentColWidth(extWidth:number) {
  
      if(this.extCubeWidth) {
        let regColumnWidth:number = 100
        let nbrOfClumns:number = this.extCubeWidth
        let totalLeftCellBorders:number = (this.extCubeWidth * 1) + 1
        let padding:number = 15;
        this.commentColWidth = (extWidth - ((regColumnWidth * nbrOfClumns)+ padding + totalLeftCellBorders))
      }
    }

    private calcTblHeight(extHeight:number) {
      this.tblHeaderHeight = 28;
      this.tblFooterHeight = 28;
      let totalVerticalBorders:number = 2;
      this.tblBodyHeight = extHeight - (this.tblHeaderHeight + this.tblFooterHeight + totalVerticalBorders)
    }

    private initGuiVars() {
      this.calcCommentColWidth(this.element.width())
      this.showEditForCell = -1;
      this.textAreaComment = "";
    }
    
    private _propertiesPanel: object;
    private headerWidth: number;

  // ============================== injector / Constructor ======================================================
  static $inject = ["$timeout", "$element", "$scope", "$http", "$window"];

  constructor(timeout: ng.ITimeoutService, private element: JQuery, private scope: ng.IScope, private http: ng.IHttpProvider, private window:ng.IWindowService) {
    const that: any = this;

    
    // horizontal Scrollbar ================================================
    let childElements = this.element.children()

    console.log(childElements);

    let header:any = this.element.children()[0]
    let headerTableContainer = header.children[0]
    let body:any = this.element.children()[1]

    that.headerWidth = body.clientWidth

    body.onscroll = function(e) {
      let bodyScrollPosition = (e.target as any).scrollLeft;
      that.headerWidth = body.clientWidth
      headerTableContainer.scrollTo(bodyScrollPosition,0)
      that.scope.$apply();
    }

    window.onresize = function (e) {
      e.preventDefault()
     // headerTableContainer.style.width = body.clientWidth
      that.headerWidth = body.clientWidth
      that.scope.$apply()
    }

    window.onload = function () {
      //headerTableContainer.style.width = body.clientWidth
      that.headerWidth = body.clientWidth
      that.scope.$apply()

    }
   
    // ======================================================================


    this._propertiesPanel = that._model.layout.custom

    // GLOBAL OBJECT
    this.globalObj = that._model.session.app.global;

    // GET AUTHENTICATED USER
    this.globalObj.getAuthenticatedUser().then(user => (this.user = user));

      // track changes of size
    that.scope.$watch("vm.getSize()", (newValue: ElementSize) => {
      that.calcCommentColWidth(newValue.width)
      that.calcTblHeight(newValue.height)
      }, true);


    that.scope.$watch("vm._propertiesPanel.commentEditMode", (newValue:boolean) => {
        that.commentEditMode = newValue;
    })
  


    scope.$on("$destroy", function() {
      console.log('destroyed');
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
