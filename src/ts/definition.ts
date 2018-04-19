
    // *****************************************************************************
    // Dimensions & Measures
    // *****************************************************************************

    const dimensions = {
        uses: 'dimensions',
        min: 1,
    };
    const measures = {
        uses: 'measures',
        min: 1,
    };


// *****************************************************************************
// Appearance section
// *****************************************************************************
    const appearanceSection = {
        uses: 'settings'
    };

// =============================================================================

const extDefinition = {
    type: 'items',
    component: 'accordion',
    items: {
        dimensions: dimensions,
        measures: measures,
        appearance: appearanceSection
    }

}

export default extDefinition;
