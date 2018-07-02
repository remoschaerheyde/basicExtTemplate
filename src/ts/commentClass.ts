class Comment {
    public dateTime: string = this.getDateTime();
    public usedDimensions: string = this.createDimString();
  
    private getDateTime(): string {
      let currentdate: Date = new Date();
      return `${currentdate.getDate()}/${currentdate.getMonth() +
        1}/${currentdate.getFullYear()}|${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
    }
  
    private createDimString(): string {
      let dimString = this.dimensions.map((dim:EngineAPI.INxDimensionInfo) => dim.qGroupFallbackTitles[0]).join('|');
      delete this.dimensions
      return dimString;
    }
  
    constructor(
      private dimKey: string,
      private author: string,
      private comment: string,
      private dimensions: any,
      private extensionId: string
    ) {}
  }

  export {Comment}