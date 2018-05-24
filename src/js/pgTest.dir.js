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
        function Comment(dimKey, author, comment, dimensions, extensionId) {
            this.dimKey = dimKey;
            this.author = author;
            this.comment = comment;
            this.dimensions = dimensions;
            this.extensionId = extensionId;
            this.dateTime = this.getDateTime();
            this.usedDimensions = this.createDimString();
        }
        Comment.prototype.getDateTime = function () {
            var currentdate = new Date();
            return currentdate.getDate() + "/" + (currentdate.getMonth() +
                1) + "/" + currentdate.getFullYear() + "|" + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
        };
        Comment.prototype.createDimString = function () {
            var dimString = this.dimensions.map(function (dim) { return dim.qGroupFallbackTitles[0]; }).join('|');
            delete this.dimensions;
            return dimString;
        };
        return Comment;
    }());
    var CommentTblCntrl = /** @class */ (function () {
        function CommentTblCntrl(timeout, element, scope, http) {
            var _this = this;
            this.http = http;
            this.stringSeperator = '|';
            this.getDbComments = function (customHyperCubeLayout) {
                var _this = this;
                var comments = customHyperCubeLayout.qHyperCube.hyRowKeys;
                this.http({
                    url: "http://localhost:5000/api/comments/get_all",
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
                }).catch(function (err) {
                    console.log('no comments from api received');
                    _this.setData(customHyperCubeLayout.qHyperCube);
                });
            };
            this.addOrUpdateComment = function (row) {
                var _this = this;
                var newComment = new Comment(this.createDimKey(row), this.user, this.textAreaComment, this._dimensionsInfo, this._model.id);
                this.http({
                    url: "http://localhost:5000/api/comments/add_new_comment",
                    method: "POST",
                    data: { newComment: JSON.stringify(newComment) },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) {
                    _this._model.emit("changed");
                }).catch(function (err) {
                    console.log(err);
                });
                this.textAreaComment = "";
            };
            this.deleteComment = function (row) {
                var _this = this;
                var dimKey = this.createDimKey(row);
                var commentToDelete = { dimKey: dimKey };
                this.http({
                    url: "http://localhost:5000/api/comments/delete_comment",
                    method: "POST",
                    data: { dimKey: JSON.stringify(dimKey) },
                    headers: { "Content-Type": "application/json" }
                }).then(function (res) {
                    _this._model.emit("changed");
                });
            };
            var that = this;
            // GLOBAL OBJECT
            this.globalObj = that._model.session.app.global;
            // GET AUTHENTICATED USER
            this.globalObj.getAuthenticatedUser().then(function (user) { return (_this.user = user); });
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
            var _this = this;
            var that = this;
            if (hyperCube.qDataPages && hyperCube.qDataPages.length > 0) {
                this.cubeWidth = hyperCube.qDimensionInfo.length + hyperCube.qMeasureInfo.length;
                if (hyperCube.hyComments) {
                    this._matrixData = hyperCube.qDataPages[0].qMatrix;
                    this.cubeWidthWithComments = this.cubeWidth + 1;
                    this.commentColIndex = this.cubeWidth;
                    this._matrixData.forEach(function (row) { return row.push({ qText: "", qState: "L" }); });
                    hyperCube.hyComments.forEach(function (comment) {
                        _this._matrixData[comment.tableRowIndex].splice(-1, 1);
                        _this._matrixData[comment.tableRowIndex].push({ qText: comment.comment, qState: "L" });
                    });
                }
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
                    rowKeys = genHyperCubeLayout.qHyperCube.qDataPages[0].qMatrix.map(function (row, rowIndex) {
                        return { tableRowKey: _this.createDimKey(row), tableRowIndex: rowIndex };
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
        // CREATE DIMENSION KEY ===================================================================================
        CommentTblCntrl.prototype.createDimKey = function (row) {
            return row.filter(function (col) { return col.qState !== "L"; }).map(function (cell) { return cell.qText; }).join(this.stringSeperator);
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
//# sourceMappingURL=pgTest.dir.js.map