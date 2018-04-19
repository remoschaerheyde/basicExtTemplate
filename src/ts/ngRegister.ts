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