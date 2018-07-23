(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Comment = /** @class */ (function () {
        function Comment(dimKey, author, comment, dimensions, 
        //   private context: SelectionContext,
        extensionId) {
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
    exports.Comment = Comment;
});
//# sourceMappingURL=commentClass.js.map