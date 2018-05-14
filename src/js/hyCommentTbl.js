(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "text!../templates/hyCommentTbl.html", "css!../css/hyCommentTbl.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var template = require("text!../templates/hyCommentTbl.html");
    require("css!../css/hyCommentTbl.css");
    var Comment = /** @class */ (function () {
        function Comment(dimKey, author, comment, dimensions) {
            this.dimKey = dimKey;
            this.author = author;
            this.comment = comment;
            this.dimensions = dimensions;
            this._dateTime = this.dateTime();
        }
        Comment.prototype.dateTime = function () {
            var currentdate = new Date();
            return currentdate.getDate() + "/" + (currentdate.getMonth() +
                1) + "/" + currentdate.getFullYear() + "|" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
        };
        return Comment;
    }());
    var CommentTblCntrl = /** @class */ (function () {
        function CommentTblCntrl(timeout, element, scope, http, _user) {
            var _this = this;
            this.http = http;
            this._user = _user;
            this.commentSeparator = "|#£?|";
            // GET COMMENTS ============================================================================================
            this.getSelectedComments = function () {
                if (this._keySelectedComment) {
                    var key = this._keySelectedComment;
                    this.http({
                        url: "http://localhost:3000/comments/getcomment",
                        method: "POST",
                        data: { key: key },
                        headers: { "Content-Type": "application/json" }
                    }).then(function (res) {
                        console.log(res);
                    });
                }
            };
            // POST COMMENT ============================================================================================
            this.createCommentFromScope = function () {
                if (this._keySelectedComment && this.textAreaComment) {
                    // Dimension key
                    var dimKey = this._keySelectedComment;
                    // author
                    var author = this._user;
                    // Comment
                    var textAreaComment = this.textAreaComment;
                    var dimensions = this._dimensionsInfo
                        .map(function (dim) { return dim.qFallbackTitle; })
                        .join(this.commentSeparator);
                    return new Comment(dimKey, author, textAreaComment, dimensions);
                }
                else {
                    console.log("information is missing");
                }
            };
            this.postComment = function () {
                var _this = this;
                var comment = this.createCommentFromScope();
                if (comment) {
                    console.log(comment);
                    this.http({
                        url: "http://localhost:3000/comments/add",
                        method: "POST",
                        data: { comment: comment },
                        headers: { "Content-Type": "application/json" }
                    }).then(function (res) {
                        console.log("Comment succesfully added");
                        _this._model.emit("changed");
                    });
                }
            };
            // UI HELPERS =======================================================
            this.state = { selected: undefined };
            this.commentSelToggle = function (index) {
                this.state.selected = this.state.selected != index ? index : undefined;
            };
            // ============================ Retrieving comments =================
            this.retrieveComments = function () {
                var _this = this;
                this.http({
                    url: "http://localhost:3000/comments/retrieveAll",
                    method: "GET"
                }).then(function (comments) {
                    _this._model.app.getObject(_this.extId).then(function (extObj) {
                        extObj.getProperties().then(function (extProps) {
                            extProps.hComments = comments.data;
                            console.log(extProps);
                            extObj.setProperties(extProps).then(function () {
                                extObj.getLayout();
                            });
                        });
                    });
                });
            };
            // =======================================================================
            this.clearDb = function () {
                console.log("test");
                this.http({
                    url: "http://localhost:3000/comments/clearDb",
                    method: "GET"
                }).then(function (res) {
                    console.log(res);
                });
            };
            // dev functions ============================================================
            this.getExtProps = function () {
                this._model.app.getObject(this.extId).then(function (extObj) {
                    console.log(extObj);
                });
            };
            this.reload = function () {
                var _this = this;
                this._model.app.doReload(0, true, false).then(function (res) {
                    _this._model.app.getAppLayout().then(function (layout) {
                        _this._model.app.resume().then(function () {
                            console.log('resuming app');
                        });
                    });
                });
            };
            var that = this;
            this.globalObj = that._model.session.app.global;
            this.extId = this._model.id;
            this.globalObj.getAuthenticatedUser().then(function (user) { return (_this._user = user); });
            scope.$on("$destroy", function () {
                that.destroySessionObject();
            });
        }
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
            // Model ==================================================================================
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
        CommentTblCntrl.prototype.modelChanged = function () {
            var that = this;
            var hyperCubeDef;
            if (that._model) {
                that._model.on("changed", function () {
                    // ========== Creating dynamic hypercube ==========//
                    that._model
                        .getProperties()
                        .then(function (extProps) {
                        hyperCubeDef = extProps.qHyperCubeDef;
                        that.extCubeWidth =
                            extProps.qHyperCubeDef.qDimensions.length +
                                extProps.qHyperCubeDef.qMeasures.length;
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
                        .then(function () { return that.createSessionObject(); });
                });
                that._model.emit("changed");
            }
        };
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
        CommentTblCntrl.prototype.setData = function (hyperCube) {
            var _this = this;
            // set Hypercube Matrix Data
            var that = this;
            console.log(hyperCube.qDataPages);
            var addCommentsToCube = function () {
                return new Promise(function (resolve, reject) {
                    that.http({
                        url: "http://localhost:3000/comments/addCommentsToCube",
                        method: "POST",
                        data: { matrix: hyperCube.qDataPages[0].qMatrix, commentSeparator: that.commentSeparator },
                        headers: { "Content-Type": "application/json" }
                    }).then(function (matrixData) {
                        resolve(matrixData.data);
                    });
                });
            };
            var addCubeToScope = function (newMatrix) {
                return new Promise(function (resolve, reject) {
                    console.log(newMatrix);
                    if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {
                        //this._matrixData = hyperCube.qDataPages[0].qMatrix;
                        _this._matrixData = newMatrix;
                        console.log(_this);
                        // create comment key ==========================
                    }
                    else {
                        _this._matrixData = [];
                    }
                    // set Dimension Information
                    if (hyperCube.qDimensionInfo && hyperCube.qDimensionInfo.length > 0) {
                        _this._dimensionsInfo = hyperCube.qDimensionInfo;
                    }
                    else {
                        _this._dimensionsInfo = [];
                    }
                    // set Measure Information
                    if (hyperCube.qMeasureInfo && hyperCube.qMeasureInfo.length > 0) {
                        _this._measureInfo = hyperCube.qMeasureInfo;
                        _this.maxY = hyperCube.qMeasureInfo[0].qMax;
                    }
                    else {
                        _this.maxY = 0;
                    }
                    resolve();
                });
            };
            addCommentsToCube().then(addCubeToScope);
        };
        CommentTblCntrl.prototype.destroySessionObject = function () {
            var that = this;
            if (that._genericObjectId !== undefined) {
                // destroy session object
                that.model.app
                    .destroySessionObject(that._genericObjectId)
                    .then(function (result) {
                    // nothing to do
                });
            }
        };
        // ================== add comments to hypercube ========================================== //
        // =================== Create session object ============================================= //
        CommentTblCntrl.prototype.createSessionObject = function () {
            var _this = this;
            var that = this;
            var hyperCubeProp = {
                qInfo: {
                    qId: "",
                    qType: "HyperCube"
                },
                qHyperCubeDef: this._hyperCubeDef
            };
            this._model.app
                .createObject(hyperCubeProp)
                .then(function (genericObject) {
                _this._genericObjectId = genericObject.id;
                genericObject
                    .getLayout()
                    .then(function (genHyperCubeLayout) {
                    that.setData(genHyperCubeLayout.qHyperCube);
                });
            });
        };
        CommentTblCntrl.prototype.createDimKey = function (tableRow) {
            var selectedDimensions = tableRow.map(function (cellValue) { return cellValue.qText; });
            var key = selectedDimensions.join(this.commentSeparator);
            this._keySelectedComment = key;
        };
        CommentTblCntrl.prototype.editComment = function (tableRow) {
            if (!this._editMode) {
                this.createDimKey(tableRow);
                console.log(this);
            }
        };
        // ============================== injector / Constructor ======================================================
        CommentTblCntrl.$inject = ["$timeout", "$element", "$scope", "$http"];
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
//# sourceMappingURL=hyCommentTbl.js.map