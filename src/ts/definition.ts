
// *****************************************************************************
// Dimensions
// *****************************************************************************

    const dimText = {
        label: function(d) {
            return  d.custom.hideDimKeyRegister.text
        },
		component: "text"
    };
    
    const customDimensions = {
        uses: "dimensions",
        min: 1
    }
      
    const keyDimensions = {
        type: "items",
        label: "Key Dimensions",
        items: {
            dimText:dimText,
            dimContainer: {
                type: "items",
                label: "dimensions",
                show: (d) => {
                    return d.custom.hideDimKeyRegister.v === false
                },
                items: {
                    data_dimensions: customDimensions
                }
                
            }
            
        }
    }




 
// *****************************************************************************
// measures
// *****************************************************************************

    const measures = {
        uses: "measures",
        min: 0
    }

// *****************************************************************************
// Appearance 
// *****************************************************************************



const modeSettingsSwitch = {
    type: "boolean",
    component: "switch",
    label: "View/Edit Mode",
    ref: "custom.commentEditMode",
    options: [{
        value: true,
        label: "Edit"
    }, {
        value: false,
        label: "View"
    }],
    defaultValue: false
}


const appearanceSection = {
    uses: 'settings',
    items: {
        modeSettings: {
            label: "Mode Settings",
            type: "items",
            items: {
                modeSettingsSwitch: modeSettingsSwitch
            }
        }
    }
};


// *****************************************************************************
// Sorting 
// *****************************************************************************

const sorting = {
    uses: 'sorting'

};



// *****************************************************************************
// Ext settings
// *****************************************************************************

const keySettingsText = {
    label: "Hiding the 'Key Dimensions' window helps to ensure that users don't accidently add or remove dimensions which are needed in order to connect the comments to the data matrix of the extension.",
    component: "text"
};


const testSwitch = {
    type: "boolean",
    component: "switch",
    label: "Hide Key Dimensions",
    ref: "custom.hideDimKeyRegister",
    options: [
        {
        value: {v: false, text: 'Please add the dimensions which you would like to add to your table and which will be associated with your comments'},
        label: "off"
        },
        {
        value: {v: true, text: "Your Key Dimensions are currently hidden. This is a security setting which prevents users from accidently changing the dimension key, which is used to connect your comments to the underlying data matrix the extension is based on. You can disable this setting in this security settings"},
        label: "on"
        }, 
    ]
}


const extSettings = {
    component: "expandable-items",
    label: "Settings",
    items: {
        keySettings: {
            label: "Security",
            type: "items",
            items: {
                keySettingsText: keySettingsText,
                testSwitch: testSwitch
            }
        }
    }
}



// *****************************************************************************
// About section
// *****************************************************************************


const aboutText = {
    label: "Copyright 2018 Heyde Schweiz AG",
    component: "text"
};




const about = {
    type: "items",
    label: 'About',
    items: {
        logo: aboutText
    }
}



// =============================================================================

const extDefinition = {
    type: 'items',
    component: 'accordion',
    items: {
        keyDimensions: keyDimensions,
        measures: measures,
        sorting: sorting,
        appearance: appearanceSection,
        extSettings: extSettings,
        about: about
    }
}





export default extDefinition;
