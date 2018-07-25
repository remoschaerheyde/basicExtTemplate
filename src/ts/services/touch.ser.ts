export function TouchService() {


    this.getWidthChange = function(newWidthChange:number) {
        return this.widthChange
    }

    this.setWidthChange = function(newWidthChange) {
        console.log('setting width');
        this.widthChange = newWidthChange;
    }

    this.getIndex = function(currentIndex) {
        return this.currentIndex 
    }

    this.setIndex = function(currentIndex) {
        this.currentIndex = currentIndex
    }

    this.resetIndex = function() {
        this.currentIndex = undefined; 
    }




 
}




