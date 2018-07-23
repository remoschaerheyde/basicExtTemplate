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
  private _propertiesPanel: any;
  private headerWidth: number;
  private _tblCols: {cId: string, headerTitle: string, type:string, colWidth: number}[]
  private context: SelectionContext;
  private _maxY: number;

  public get dimensionsInfo(): any {
    return this._dimensionsInfo;
  }
  
  private _measureInfo: any;
  public get measureInfo(): any {
    return this._measureInfo;
  }
  
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

        let tblCols = [];

        // ADD DIMENSION INFO TO SCOPE ===============================================================
        if (hyperCube.qDimensionInfo && hyperCube.qDimensionInfo.length > 0) {
          this._dimensionsInfo = hyperCube.qDimensionInfo;

          hyperCube.qDimensionInfo.forEach(dimInfo => {
        
            tblCols.push({cId: (dimInfo as any).cId, headerTitle: dimInfo.qGroupFallbackTitles[0], type: 'D', colWidth: 200})

          })
        } else {
          this._dimensionsInfo = [];
        }
        // ADD HEADER INFO TO SCOPE ====================================================================
        if (hyperCube.qMeasureInfo && (hyperCube.qMeasureInfo as any).length > 0) {
          this._measureInfo = hyperCube.qMeasureInfo;

          this.maxY = hyperCube.qMeasureInfo[0].qMax;

          (hyperCube.qMeasureInfo as any).forEach(measureInfo => {
            tblCols.push({cId: (measureInfo as any).cId, headerTitle: measureInfo.qFallbackTitle, type: 'M', colWidth: 200})
          })

        } else {
          this.maxY = 0;
        }
        // set Header Comment Titles =======================================================================
        tblCols.push({cId: 'comment', headerTitle: 'Comments', type: 'comment', colWidth: 400})

        this._model.app.getObject(this._model.id).then(genObj => {

        
          genObj.getProperties().then(genObjProps => {
            if(genObjProps.hyTblCols) {
              let savedIds = genObjProps.hyTblCols.map(col => col.cId).toString()
              let cubeIds = tblCols.map(col => col.cId).toString()
  
              if(savedIds === cubeIds) {
                this._tblCols = genObjProps.hyTblCols
              } else {
                this._tblCols = tblCols
              }
            } else {
              this._tblCols = tblCols
            }

          }).catch(err => console.log('could not get gen obj props', err))
        }).catch(err => console.log('could not get obj', err))
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

    //this.getAppSelections().then(selections => {

      let newComment = new Comment(this.createDimKey(row), this.user, this.textAreaComment, this._dimensionsInfo, this._model.id)

      this.http({
        url: this.apiCommentRoute +  "add_new_comment",
        method: "POST",
        data: { newComment: JSON.stringify(newComment) },
        headers: { "Content-Type": "application/json" }
      }).then(res => this._model.emit("changed")
      ).catch(err => console.log('could not add new comment',err))

    //}).catch(err => console.log('could not get app selections', err))

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

    // private getContext() {
    //   return {
    //     fieldOne: this._propertiesPanel.context.fieldOne,
    //     fieldTwo: this._propertiesPanel.context.fieldTwo,
    //     fieldThree: this._propertiesPanel.context.fieldThree,
    //     fieldFour: this._propertiesPanel.context.fieldFour,
    //     fieldFive: this._propertiesPanel.context.fieldFive,
    //   }
    // }
    

    // colum Resize Settings
    private resizeColumn:{width:number, index: number, cursorStartPosition: number};

    private resizeStart(event, index) {
      // mousedown event
      this.resizeColumn = {width: this._tblCols[index].colWidth, index: index, cursorStartPosition: event.clientX}
    }

    private resizeEnd(event) {
      if(this.resizeColumn) {
        let resizeEnd = event.clientX;

        let headerElementStartPosition = (this.resizeColumn.cursorStartPosition - this.resizeColumn.width);
        let newWidth = resizeEnd - headerElementStartPosition;
        let minColWidth = 20;

        if(newWidth >= minColWidth) {
          this._tblCols[this.resizeColumn.index].colWidth = newWidth;

          this.resizeColumn = undefined;
        }
      }
    }


    /*

    private getAppSelections() {
      return new Promise((resolve,reject) => {

      let params = {
            "qInfo": {
              "qId": "CurrentSelection",
              "qType": "CurrentSelection"
            },
            "qSelectionObjectDef": {}
      }
      this._model.app.createSessionObject(params).then(sessionObj => {
        sessionObj.getLayout().then(sessionObjLayout => {
          let appSelections = (sessionObjLayout as any).qSelectionObject.qSelections.map((selection => {return {field: selection.qField, value: selection.qSelected }}))
          resolve(appSelections)
        })
      })
      })
    }

    */
   




  

    private saveProperties() {
      console.log('saving extension properties');
      this._model.app.getObject(this._model.id).then(extObj =>{

        extObj.getProperties().then(extProps => {
          let newProperties = extProps

          // ADD PROPERTIES HERE ============>>

          newProperties.hyTblCols = this._tblCols;

          extObj.setProperties(newProperties)
          .then(() => extObj.getLayout())
        })
      })
    }


  // ============================== injector / Constructor ======================================================
  static $inject = ["$timeout", "$element", "$scope", "$http", "$window"];

  constructor(timeout: ng.ITimeoutService, private element: JQuery, private scope: ng.IScope, private http: ng.IHttpProvider, private window:ng.IWindowService) {
    
    const that: any = this;



    
    // GET USER INFO ============================================= >>>>>>>>>>>
    this.globalObj = that._model.session.app.global;
    this.globalObj.getAuthenticatedUser().then(user => (this.user = user));

    // SCROLLBARS ================================================ >>>>>>>>>>>

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
   
    // WATCHERS ================================================ >>>>>>>>>>>


    
    this._propertiesPanel = that._model.layout.custom

    // ELEMENT SIZE
    that.scope.$watch("vm.getSize()", (newValue: ElementSize) => {
      that.calcCommentColWidth(newValue.width)
      that.calcTblHeight(newValue.height)
      }, true);


    // EDIT MODE
    that.scope.$watch("vm._propertiesPanel.commentEditMode", (newValue:boolean) => {
        that.commentEditMode = newValue;
    })
  
    
    // that.scope.$watch("vm.getContext()", (newContext:SelectionContext) => {
    //   this.context = newContext;
    // }, true)
    


    

    // SAVE PROPERTIES ==========================================================================
    window.onbeforeunload = function functionName() {
      console.log('beforeunload');
      that.saveProperties();

    }
    
    scope.$on("$destroy", function() {
      console.log('destroyed');
      
      that.saveProperties();
      
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
