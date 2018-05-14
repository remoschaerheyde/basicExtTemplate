import { utils } from "../../node_modules/davinci.js/dist/umd/daVinci";
import * as template from "text!../templates/hyCommentTbl.html";
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
          .then((extProps: EngineAPI.IGenericObjectProperties) => {
            hyperCubeDef = extProps.qHyperCubeDef;

            that.extCubeWidth =
              extProps.qHyperCubeDef.qDimensions.length +
              extProps.qHyperCubeDef.qMeasures.length;

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

  private setData(hyperCube: EngineAPI.IHyperCube) {
    // set Hypercube Matrix Data
    let that:any = this;
    console.log(hyperCube.qDataPages);

    let addCommentsToCube = function() {
        
        return new Promise((resolve, reject) => {

            that.http({
                    url: "http://localhost:3000/comments/addCommentsToCube",
                    method: "POST",
                    data: { matrix: hyperCube.qDataPages[0].qMatrix, commentSeparator: that.commentSeparator},
                    headers: { "Content-Type": "application/json" }
            }).then(matrixData => {
                resolve(matrixData.data);
            });
        }) 
    }


    let addCubeToScope = (newMatrix) => {
        return new Promise((resolve,reject) => {

            console.log(newMatrix);
            if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {
                
                //this._matrixData = hyperCube.qDataPages[0].qMatrix;
                this._matrixData = newMatrix
          
                console.log(this);
                // create comment key ==========================
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
              resolve();
        })
    }

    addCommentsToCube().then(addCubeToScope)



  }

  // =================== Destory session object ============================================= //
  private _genericObjectId: string;
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

  // ================== add comments to hypercube ========================================== //

  // =================== Create session object ============================================= //

  private createSessionObject() {
    let that = this;

    let hyperCubeProp: EngineAPI.IGenericObjectProperties = {
      qInfo: {
        qId: "",
        qType: "HyperCube"
      },
      qHyperCubeDef: this._hyperCubeDef
    };

    this._model.app
      .createObject(hyperCubeProp)
      .then((genericObject: EngineAPI.IGenericObject) => {
        this._genericObjectId = genericObject.id;

        genericObject
          .getLayout()
          .then((genHyperCubeLayout: EngineAPI.IGenericHyperCubeLayout) => {
            that.setData(genHyperCubeLayout.qHyperCube);
          });
      });
  }

  // CREATE DIMENSION KEY ===================================================================================

  private _keySelectedComment;

  private createDimKey(tableRow: { qText: string }[]) {
    let selectedDimensions: string[] = tableRow.map(
      cellValue => cellValue.qText
    );
    let key: string = selectedDimensions.join(this.commentSeparator);
    this._keySelectedComment = key;
  }

  private editComment(tableRow: { qText: string }[]) {
    if (!this._editMode) {
      this.createDimKey(tableRow);
      console.log(this);
    }
  }

  // GET COMMENTS ============================================================================================

  private getSelectedComments = function() {
    if (this._keySelectedComment) {
      let key: string = this._keySelectedComment;

      this.http({
        url: "http://localhost:3000/comments/getcomment",
        method: "POST",
        data: { key: key },
        headers: { "Content-Type": "application/json" }
      }).then(res => {
        console.log(res);
      });
    }
  };

  // POST COMMENT ============================================================================================

  createCommentFromScope = function() {
    if (this._keySelectedComment && this.textAreaComment) {
      // Dimension key
      let dimKey: string = this._keySelectedComment;
      // author
      let author: string = this._user;
      // Comment
      let textAreaComment: string = this.textAreaComment;

      let dimensions: string = this._dimensionsInfo
        .map(dim => dim.qFallbackTitle)
        .join(this.commentSeparator);

      return new Comment(dimKey, author, textAreaComment, dimensions);
    } else {
      console.log("information is missing");
    }
  };

  private postComment = function() {
    let comment = this.createCommentFromScope();
    if (comment) {
      console.log(comment);
      this.http({
        url: "http://localhost:3000/comments/add",
        method: "POST",
        data: { comment: comment },
        headers: { "Content-Type": "application/json" }
      }).then(res => {
        console.log("Comment succesfully added");
        this._model.emit("changed");


      });
    }
  };

  // UI HELPERS =======================================================

  private state: any = { selected: undefined };

  private commentSelToggle = function(index) {
    this.state.selected = this.state.selected != index ? index : undefined;
  };

  // ============================ Retrieving comments =================

  private retrieveComments = function() {
    this.http({
      url: "http://localhost:3000/comments/retrieveAll",
      method: "GET"
    }).then(comments => {
      this._model.app.getObject(this.extId).then(extObj => {
        extObj.getProperties().then(extProps => {
          extProps.hComments = comments.data;
          console.log(extProps);
          extObj.setProperties(extProps).then(() => {
            extObj.getLayout();
          });
        });
      });
    });
  };

  // =======================================================================

  private clearDb = function() {
    console.log("test");
    this.http({
      url: "http://localhost:3000/comments/clearDb",
      method: "GET"
    }).then(res => {
      console.log(res);
    });
  };

  // dev functions ============================================================

  private getExtProps = function() {
    this._model.app.getObject(this.extId).then(extObj => {
      console.log(extObj);
    });
  };


  private reload = function() {
    this._model.app.doReload(0,true,false).then((res) => {
        this._model.app.getAppLayout().then(layout => {
            this._model.app.resume().then(() => {

                console.log('resuming app');
            } )
        })
    }
)
 
  };

  // ============================== injector / Constructor ======================================================
  static $inject = ["$timeout", "$element", "$scope", "$http"];

  constructor(
    timeout: ng.ITimeoutService,
    element: JQuery,
    scope: ng.IScope,
    private http: ng.IHttpProvider,
    private _user: string
  ) {
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
  return (
    $document: ng.IAugmentedJQuery,
    $injector: ng.auto.IInjectorService,
    $registrationProvider: any
  ) => {
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
