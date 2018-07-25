(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "text!../templates/pgTest.html", "css!../css/main.css", "./customInterfaces", "./commentClass"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var template = require("text!../templates/pgTest.html");
    require("css!../css/main.css");
    require("./customInterfaces");
    var commentClass_1 = require("./commentClass");
    var CommentTblCntrl = /** @class */ (function () {
        function CommentTblCntrl(timeout, element, scope, http, window, touchStart, touch) {
            var _this = this;
            this.element = element;
            this.scope = scope;
            this.http = http;
            this.window = window;
            this.touchStart = touchStart;
            this.touch = touch;
            this.stringSeperator = '|';
            this.apiCommentRoute = 'http://localhost:5000/api/comments/';
            this.minColWidth = 20;
            this.minColWidthCommentCol = 300;
            // ================== Set the data of the session object ================================//
            this.getDbComments = function (customHyperCubeLayout) {
                var _this = this;
                var comments = customHyperCubeLayout.qHyperCube.hyRowKeys;
                var extId = this._model.id;
                this.http({
                    url: this.apiCommentRoute + "get_all",
                    method: "POST",
                    data: { comments: JSON.stringify(comments), extId: JSON.stringify(extId) },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) {
                    _this._model.app.getObject(_this._genericObjectId).then(function (sessionObj) {
                        sessionObj.getProperties().then(function (sessionObjProps) {
                            sessionObjProps.qHyperCubeDef.hyComments = res.data;
                            sessionObj.setProperties(sessionObjProps).then(function () {
                                sessionObj.getLayout().then(function (newCubeLayoutWithComments) {
                                    _this.setData(newCubeLayoutWithComments.qHyperCube);
                                }).catch(function (err) { return console.log('could not get customised hypercube layout', err); });
                            }).catch(function (err) { return console.log('could not set custom cube properties', err); });
                        }).catch(function (err) { return console.log('could not get generic object properties', err); });
                    }).catch(function (err) { return console.log('could not get generic object', err); });
                }).catch(function (err) {
                    console.log('no comments from api received');
                    _this.setData(customHyperCubeLayout.qHyperCube);
                });
            };
            // ================== API CALLS =======================================//
            this.addOrUpdateComment = function (row) {
                //this.getAppSelections().then(selections => {
                var _this = this;
                var newComment = new commentClass_1.Comment(this.createDimKey(row), this.user, this.textAreaComment, this._dimensionsInfo, this._model.id);
                this.http({
                    url: this.apiCommentRoute + "add_new_comment",
                    method: "POST",
                    data: { newComment: JSON.stringify(newComment) },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) { return _this._model.emit("changed"); }).catch(function (err) { return console.log('could not add new comment', err); });
                //}).catch(err => console.log('could not get app selections', err))
            };
            this.deleteComment = function (row) {
                var _this = this;
                var dimKey = this.createDimKey(row);
                var extId = this._model.id;
                this.http({
                    url: this.apiCommentRoute + "delete_comment",
                    method: "POST",
                    data: { dimKey: JSON.stringify(dimKey), extId: JSON.stringify(extId) },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) { return _this._model.emit("changed"); }).catch(function (err) { return console.log('could not delete comment', err); });
            };
            var that = this;
            that.scope.$watch("vm.touch.getWidthChange()", function (widthChange) {
                var index = that.touch.getIndex();
                if (typeof widthChange !== 'undefined' && typeof index !== 'undefined') {
                    var newWidth = that._tblCols[index].colWidth + widthChange;
                    if (index === that.commentColIndex) {
                        console.log('setting comment col');
                        if (newWidth > that.minColWidthCommentCol) {
                            console.log(newWidth);
                            that._tblCols[index].colWidth = newWidth;
                        }
                        else {
                            that._tblCols[index].colWidth = that.minColWidthCommentCol;
                            console.log("the comment col cannot be smaller than " + that.minColWidthCommentCol);
                        }
                    }
                    else {
                        if (newWidth > that.minColWidth) {
                            that._tblCols[index].colWidth = newWidth;
                        }
                        else {
                            that._tblCols[index].colWidth = that.minColWidth;
                            console.log("columns cannot be smaller thant " + that.minColWidth);
                        }
                    }
                    that.headerWidth = body.clientWidth;
                    that.$scope.$apply();
                }
            }, true);
            // // TOUCHSCREEN SUPPORT =======================================================================================
            // that.scope.$watch("vm.touchStart.touchStartPosition", (newValue) => {
            //   console.log('touchstart');
            //  console.log(this.touchStart.touchStartPosition);
            //   //this.resizeStart()
            //   let width = this._tblCols[this.touchStart.index].colWidth
            //   that.resizeColumn = {width: width, index: this.touchStart.index, cursorStartPosition: this.touchStart.touchStartPosition}
            // })
            // element.bind('touchmove', function(event:any) {
            //   that.touchTrack = event.touches[0].clientX
            // })
            // element.bind('touchend', function(event:any) {
            //   //let touchend = (event.originalEvent as any).touches[0].pageX
            //     console.log('touchend');
            //     console.log(that.touchTrack);
            //  // console.log(touchend);
            //  if(that.resizeColumn) {
            //    console.log('resizing column');
            //   let resizeEnd = that.touchTrack;
            //   let headerElementStartPosition = (that.resizeColumn.cursorStartPosition - that.resizeColumn.width);
            //   let newWidth = resizeEnd - headerElementStartPosition;
            //   let minColWidth = 20;
            //   let minColWidthCommentCol = 300
            //   if(that.resizeColumn.index === that.commentColIndex) {
            //     if(newWidth >= minColWidthCommentCol) {
            //         that._tblCols[that.resizeColumn.index].colWidth = newWidth;
            //         that.resizeColumn = undefined;
            //     } else {
            //       that._tblCols[that.resizeColumn.index].colWidth = 300;
            //       that.resizeColumn = undefined;
            //     }
            //   } else {
            //     if(newWidth >= minColWidth) {
            //       that._tblCols[that.resizeColumn.index].colWidth = newWidth;
            //       that.resizeColumn = undefined;
            //     } else {
            //       that._tblCols[that.resizeColumn.index].colWidth = 20;
            //       that.resizeColumn = undefined;
            //     }
            //   }
            // }
            //})
            // GET USER INFO ============================================= >>>>>>>>>>>
            this.globalObj = that._model.session.app.global;
            this.globalObj.getAuthenticatedUser().then(function (user) { return (_this.user = user); });
            // SCROLLBARS ================================================ >>>>>>>>>>>
            var header = this.element.children()[0];
            var headerTableContainer = header.children[0];
            var body = this.element.children()[1];
            that.headerWidth = body.clientWidth;
            body.onscroll = function (e) {
                var bodyScrollPosition = e.target.scrollLeft;
                that.headerWidth = body.clientWidth;
                headerTableContainer.scrollTo(bodyScrollPosition, 0);
                that.scope.$apply();
            };
            window.onresize = function (e) {
                e.preventDefault();
                // headerTableContainer.style.width = body.clientWidth
                that.headerWidth = body.clientWidth;
                that.scope.$apply();
            };
            window.onload = function () {
                //headerTableContainer.style.width = body.clientWidth
                that.headerWidth = body.clientWidth;
                that.scope.$apply();
            };
            // WATCHERS ================================================ >>>>>>>>>>>
            this._propertiesPanel = that._model.layout.custom;
            // ELEMENT SIZE
            that.scope.$watch("vm.getSize()", function (newValue) {
                that.calcCommentColWidth(newValue.width);
                that.calcTblHeight(newValue.height);
            }, true);
            // EDIT MODE
            that.scope.$watch("vm._propertiesPanel.commentEditMode", function (newValue) {
                that.commentEditMode = newValue;
            });
            // that.scope.$watch("vm.getContext()", (newContext:SelectionContext) => {
            //   this.context = newContext;
            // }, true)
            // 
            // SAVE PROPERTIES ==========================================================================
            window.onbeforeunload = function functionName() {
                console.log('beforeunload');
                that.saveProperties();
            };
            scope.$on("$destroy", function () {
                console.log('destroyed');
                that.saveProperties();
                that.destroySessionObject();
            });
        }
        Object.defineProperty(CommentTblCntrl.prototype, "dimensionsInfo", {
            get: function () {
                return this._dimensionsInfo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommentTblCntrl.prototype, "measureInfo", {
            get: function () {
                return this._measureInfo;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommentTblCntrl.prototype, "maxY", {
            get: function () {
                return this._maxY;
            },
            set: function (v) {
                this._maxY = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommentTblCntrl.prototype, "editMode", {
            get: function () {
                return this._editMode;
            },
            set: function (v) {
                this._editMode = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommentTblCntrl.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (v) {
                this._model = v;
                this.modelChanged();
            },
            enumerable: true,
            configurable: true
        });
        // Model ==================================================================================
        CommentTblCntrl.prototype.modelChanged = function () {
            var that = this;
            var hyperCubeDef;
            if (that._model) {
                that._model.on("changed", function () {
                    // ========== Creating dynamic hypercube ==========//
                    that._model
                        .getProperties()
                        .then(function (sessionObjProps) {
                        hyperCubeDef = sessionObjProps.qHyperCubeDef;
                        that.extCubeWidth = sessionObjProps.qHyperCubeDef.qDimensions.length + sessionObjProps.qHyperCubeDef.qMeasures.length;
                        var nxPage = {
                            qLeft: 0,
                            qTop: 0,
                            qWidth: that.extCubeWidth,
                            qHeight: 200
                        };
                        hyperCubeDef.qInitialDataFetch = [nxPage];
                        that._hyperCubeDef = hyperCubeDef;
                    })
                        .then(function () { return that.destroySessionObject(); })
                        .then(function () { return that.createSessionObject(); })
                        .then(function () { return that.initGuiVars(); });
                });
                that._model.emit("changed");
            }
        };
        CommentTblCntrl.prototype.setData = function (hyperCube) {
            var _this = this;
            try {
                if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {
                    this._matrixData = hyperCube.qDataPages[0].qMatrix;
                    this._matrixData.forEach(function (row) { return row.push({ qText: "", qState: "L" }); });
                    this.cubeWidthWithComments = this.extCubeWidth + 1;
                    this.commentColIndex = this.extCubeWidth;
                    if (hyperCube.hyComments) {
                        hyperCube.hyComments.forEach(function (comment) {
                            _this._matrixData[comment.tableRowIndex].splice(-1, 1);
                            _this._matrixData[comment.tableRowIndex].push({ qText: comment.comment, qState: "L" });
                        });
                    }
                }
                else {
                    this._matrixData = [];
                }
                var tblCols_1 = [];
                // ADD DIMENSION INFO TO SCOPE ===============================================================
                if (hyperCube.qDimensionInfo && hyperCube.qDimensionInfo.length > 0) {
                    this._dimensionsInfo = hyperCube.qDimensionInfo;
                    hyperCube.qDimensionInfo.forEach(function (dimInfo) {
                        tblCols_1.push({ cId: dimInfo.cId, headerTitle: dimInfo.qGroupFallbackTitles[0], type: 'D', colWidth: 200 });
                    });
                }
                else {
                    this._dimensionsInfo = [];
                }
                // ADD HEADER INFO TO SCOPE ====================================================================
                if (hyperCube.qMeasureInfo && hyperCube.qMeasureInfo.length > 0) {
                    this._measureInfo = hyperCube.qMeasureInfo;
                    this.maxY = hyperCube.qMeasureInfo[0].qMax;
                    hyperCube.qMeasureInfo.forEach(function (measureInfo) {
                        tblCols_1.push({ cId: measureInfo.cId, headerTitle: measureInfo.qFallbackTitle, type: 'M', colWidth: 200 });
                    });
                }
                else {
                    this.maxY = 0;
                }
                // set Header Comment Titles =======================================================================
                tblCols_1.push({ cId: 'comment', headerTitle: 'Comments', type: 'comment', colWidth: 400 });
                this._model.app.getObject(this._model.id).then(function (genObj) {
                    genObj.getProperties().then(function (genObjProps) {
                        if (genObjProps.hyTblCols) {
                            var savedIds = genObjProps.hyTblCols.map(function (col) { return col.cId; }).toString();
                            var cubeIds = tblCols_1.map(function (col) { return col.cId; }).toString();
                            if (savedIds === cubeIds) {
                                _this._tblCols = genObjProps.hyTblCols;
                            }
                            else {
                                _this._tblCols = tblCols_1;
                            }
                        }
                        else {
                            _this._tblCols = tblCols_1;
                        }
                    }).catch(function (err) { return console.log('could not get gen obj props', err); });
                }).catch(function (err) { return console.log('could not get obj', err); });
            }
            catch (err) {
                console.log('could not set data', err);
            }
            console.log(this);
        };
        // =================== Destory session object ============================================= //
        CommentTblCntrl.prototype.destroySessionObject = function () {
            var that = this;
            if (that._genericObjectId !== undefined) {
                // destroy session object
                that.model.app.destroySessionObject(that._genericObjectId)
                    .then(function (result) {
                    // nothing to do
                });
            }
        };
        // =================== Create session object ============================================= //
        CommentTblCntrl.prototype.createSessionObject = function () {
            var _this = this;
            var that = this;
            var hyperCubeProp = {
                qInfo: { qId: "", qType: "HyperCube" },
                qHyperCubeDef: this._hyperCubeDef
            };
            this._model.app
                .createObject(hyperCubeProp)
                .then(function (genericObject) {
                _this._genericObjectId = genericObject.id;
                var rowKeys;
                genericObject.getLayout().then(function (genHyperCubeLayout) {
                    rowKeys = genHyperCubeLayout.qHyperCube.qDataPages[0].qMatrix.map(function (row, rowIndex) {
                        return { tableRowKey: _this.createDimKey(row), tableRowIndex: rowIndex };
                    });
                }).then(function () {
                    genericObject.getProperties().then(function (genObjProps) {
                        genObjProps.qHyperCubeDef.hyRowKeys = rowKeys;
                        genericObject.setProperties(genObjProps).then(function () {
                            genericObject.getLayout().then(function (customHyperCubeLayout) {
                                that.getDbComments(customHyperCubeLayout);
                            }).catch(function (err) { return console.log('could not get the custom hypercube layout of the session object', err); });
                        }).catch(function (err) { return console.log('could not set session object hypercube properties with rowkeys', err); });
                    }).catch(function (err) { return console.log('could not get generic object properties of session object', err); });
                }).catch(function (err) { return console.log('could not get the generic hypercube layout of the session object', err); });
            }).catch(function (err) { return console.log('could not create session object', err); });
        };
        CommentTblCntrl.prototype.createDimKey = function (row) {
            return row.filter(function (col) { return col.qState !== "L"; }).map(function (cell) { return cell.qText; }).join(this.stringSeperator);
        };
        // ================== GUI RELATED FUNCTIONS =======================================//
        CommentTblCntrl.prototype.getSize = function () {
            return {
                height: this.element.height(),
                width: this.element.width()
            };
        };
        CommentTblCntrl.prototype.calcCommentColWidth = function (extWidth) {
            if (this.extCubeWidth) {
                var regColumnWidth = 100;
                var nbrOfClumns = this.extCubeWidth;
                var totalLeftCellBorders = (this.extCubeWidth * 1) + 1;
                var padding = 15;
                this.commentColWidth = (extWidth - ((regColumnWidth * nbrOfClumns) + padding + totalLeftCellBorders));
            }
        };
        CommentTblCntrl.prototype.calcTblHeight = function (extHeight) {
            this.tblHeaderHeight = 28;
            this.tblFooterHeight = 28;
            var totalVerticalBorders = 2;
            this.tblBodyHeight = extHeight - (this.tblHeaderHeight + this.tblFooterHeight + totalVerticalBorders);
        };
        CommentTblCntrl.prototype.initGuiVars = function () {
            this.calcCommentColWidth(this.element.width());
            this.showEditForCell = -1;
            this.textAreaComment = "";
        };
        CommentTblCntrl.prototype.resizeStart = function (event, index) {
            // mousedown event
            var width = this._tblCols[index].colWidth;
            var cursorStartPosition = event.clientX;
            this.resizeColumn = { width: width, index: index, cursorStartPosition: cursorStartPosition };
        };
        CommentTblCntrl.prototype.resizeEnd = function (event) {
            if (this.resizeColumn) {
                var resizeEnd = event.clientX;
                var headerElementStartPosition = (this.resizeColumn.cursorStartPosition - this.resizeColumn.width);
                var newWidth = resizeEnd - headerElementStartPosition;
                if (this.resizeColumn.index === this.commentColIndex) {
                    if (newWidth >= this.minColWidthCommentCol) {
                        this._tblCols[this.resizeColumn.index].colWidth = newWidth;
                        this.resizeColumn = undefined;
                    }
                    else {
                        this._tblCols[this.resizeColumn.index].colWidth = 300;
                        this.resizeColumn = undefined;
                    }
                }
                else {
                    if (newWidth >= this.minColWidth) {
                        this._tblCols[this.resizeColumn.index].colWidth = newWidth;
                        this.resizeColumn = undefined;
                    }
                    else {
                        this._tblCols[this.resizeColumn.index].colWidth = 20;
                        this.resizeColumn = undefined;
                    }
                }
            }
        };
        CommentTblCntrl.prototype.resizeStartMobile = function () {
            console.log('hello');
        };
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
        CommentTblCntrl.prototype.saveProperties = function () {
            var _this = this;
            console.log('saving extension properties');
            this._model.app.getObject(this._model.id).then(function (extObj) {
                extObj.getProperties().then(function (extProps) {
                    var newProperties = extProps;
                    // ADD PROPERTIES HERE ============>>
                    newProperties.hyTblCols = _this._tblCols;
                    extObj.setProperties(newProperties)
                        .then(function () { return extObj.getLayout(); });
                });
            });
        };
        // ============================== injector / Constructor ======================================================
        CommentTblCntrl.$inject = ["$timeout", "$element", "$scope", "$http", "$window", "£touchStart", "£touch"];
        return CommentTblCntrl;
    }());
    function ExampleDirectiveFactory() {
        "use strict";
        return function ($document, $injector, $registrationProvider) {
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
                compile: function () { }
            };
        };
    }
    exports.ExampleDirectiveFactory = ExampleDirectiveFactory;
});
//# sourceMappingURL=pgTest.dir.js.map