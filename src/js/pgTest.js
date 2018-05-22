(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "text!../templates/pgTest.html", "css!../css/hyCommentTbl.css"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var template = require("text!../templates/pgTest.html");
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
            this.getDbComments = function (customHyperCubeLayout) {
                var _this = this;
                console.log('get comments from db');
                var comments = customHyperCubeLayout.qHyperCube.hyRowKeys;
                this.http({
                    url: "http://localhost:5000",
                    method: "POST",
                    data: { comments: JSON.stringify(comments) },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) {
                    _this._model.app.getObject(_this._genericObjectId).then(function (sessionObj) {
                        sessionObj.getProperties().then(function (sessionObjProps) {
                            sessionObjProps.qHyperCubeDef.hyComments = res.data;
                            sessionObj.setProperties(sessionObjProps).then(function () {
                                sessionObj.getLayout().then(function (newCubeLayoutWithComments) {
                                    _this.setData(newCubeLayoutWithComments.qHyperCube);
                                });
                            });
                        });
                    });
                }).catch(function (err) { return console.log('could not get comment data from api'); });
            };
            // GET COMMENTS ============================================================================================
            this.getSelectedComments = function () {
                if (this._keySelectedComment) {
                    var key = this._keySelectedComment;
                    this.http({
                        url: "http://localhost:4000/comments/getcomment",
                        method: "POST",
                        data: { key: key },
                        headers: { "Content-Type": "application/json" }
                    }).then(function (res) {
                        console.log(res);
                    });
                }
            };
            // POST COMMENT ============================================================================================
            this.postComment = function () {
                console.log('posting comment');
                this.http({
                    url: "http://localhost:5000",
                    method: "POST",
                    data: { comment: 'hello' },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) {
                    console.log("Comment succesfully added");
                });
            };
            // ============================ Retrieving comments =================
            this.getAllComments = function () {
                this.http({
                    url: "http://localhost:4000/comments/getAll",
                    method: "GET"
                }).then(function (comments) {
                    console.log(comments);
                });
            };
            // =======================================================================
            this.clearDb = function () {
                this.http({
                    url: "http://localhost:4000/comments/clearDb",
                    method: "GET"
                }).then(function (res) {
                    console.log(res);
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
            // set Hypercube Matrix Data
            var that = this;
            if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {
                // determine cube width
                this.cubeWidth = hyperCube.qDimensionInfo.length + hyperCube.qMeasureInfo.length;
                hyperCube.qDataPages[0].qMatrix.forEach(function (row) { return row.push({ qText: "" }); });
                // add comment field
                hyperCube.hyComments.forEach(function (comment) {
                    hyperCube.qDataPages[0].qMatrix[comment.tableRowIndex].splice(-1, 1);
                    hyperCube.qDataPages[0].qMatrix[comment.tableRowIndex].push({ qText: comment.comment });
                });
                this._matrixData = hyperCube.qDataPages[0].qMatrix;
            }
            else {
                this._matrixData = [];
            }
            // set Dimension Information
            if (hyperCube.qDimensionInfo && hyperCube.qDimensionInfo.length > 0) {
                this._dimensionsInfo = hyperCube.qDimensionInfo;
            }
            else {
                this._dimensionsInfo = [];
            }
            // set Measure Information
            if (hyperCube.qMeasureInfo && hyperCube.qMeasureInfo.length > 0) {
                this._measureInfo = hyperCube.qMeasureInfo;
                this.maxY = hyperCube.qMeasureInfo[0].qMax;
            }
            else {
                this.maxY = 0;
            }
        };
        // =================== Destory session object ============================================= //
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
                    console.log(genHyperCubeLayout);
                    rowKeys = genHyperCubeLayout.qHyperCube.qDataPages[0].qMatrix.map(function (row, rowIndex) {
                        return { tableRowKey: row.map(function (rowItem) { return rowItem.qText; }).join('|'), tableRowIndex: rowIndex };
                    });
                }).then(function () {
                    genericObject.getProperties().then(function (genObjProps) {
                        genObjProps.qHyperCubeDef.hyRowKeys = rowKeys;
                        genericObject.setProperties(genObjProps).then(function () {
                            genericObject.getLayout().then(function (customHyperCubeLayout) {
                                that.getDbComments(customHyperCubeLayout);
                            });
                        });
                    });
                });
            });
        };
        CommentTblCntrl.prototype.getRowIndex = function (row, index) {
            this._tblRowSelected = index;
            console.log(index);
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
//# sourceMappingURL=pgTest.js.map