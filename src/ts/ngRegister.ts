function registerDirective(dirRegister:IQVAngular, dirFactory:angular.IDirectiveFactory<angular.IScope>, directiveName:string) {
    let injector:angular.auto.IInjectorService = dirRegister.$injector

    try {
        if (!injector.has(directiveName + "Directive")) {
            console.log('registring directive as:', directiveName);
            dirRegister.directive(directiveName, dirFactory);
        }
    }
    catch (err) {
        console.log("Error in checkForExistingDirective", err);
    }
}

export {registerDirective};

export interface IRegistrationObject {
    directive(name: string, directiveFactory: ng.Injectable<ng.IDirectiveFactory>): void;
    filter(name: string, filterFactoryFunction: ng.Injectable<Function>): void;
    service<T>(name: string, serviceConstructor: ng.Injectable<Function>): T;
}

export interface IRegistrationProvider {
    implementObject(object: IRegistrationObject): void;
}

export class RegistrationProvider implements IRegistrationObject {

    directive: (name: string, directiveFactory: ng.Injectable<ng.IDirectiveFactory>) => void;
    filter: (name: string, filterFactoryFunction: ng.Injectable<Function>) => void;
    service: <T>(name: string, serviceConstructor: ng.Injectable<Function>) => T;

    //#endregion
    implementObject(object: IRegistrationObject) {
        this.directive = object.directive ? object.directive : null;
        this.filter = object.filter ? object.filter : null;
        this.service = object.service ? object.service : null;
    }
}







