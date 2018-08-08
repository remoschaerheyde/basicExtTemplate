export function getEnigma(scope: ng.IScope): EngineAPI.IGenericObject {

    let enigmaRoot = undefined;

    try {
        let anyscope = scope as any;
        if (anyscope && anyscope.component && anyscope.component.model) {
            if  (anyscope.component.model.enigmaModel) {
                enigmaRoot = anyscope.component.model.enigmaModel as EngineAPI.IGenericObject;
            } else {
                enigmaRoot = anyscope.component.model as EngineAPI.IGenericObject;
            }
        }
    } catch (error) {
        console.log("Could not get Enigma", error);
    }

    return enigmaRoot;
}