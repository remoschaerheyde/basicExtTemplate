export function TouchStartService() {
    this.touchStartPosition;
    this.index;

    this.setTouchStartPosition = function(newPosition) {
        this.touchStartPosition = newPosition
    }

    this.getTouchStartPosition = function() {
        return this.touchStartPosition
    }

    this.attachTouchEvent = function(event) {
        this.touchStartEvent = event
    }

    this.setIndex = function(index) {
        this.index = index;
    }
}




