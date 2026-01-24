/**
 * Image Generation Service for Solar Panel Visualizations
 * 
 * Generates 3 different angle views of solar panel installations
 * using the assistant's image generation capabilities
 */

import { AIRoofAnalysis } from '../ai/geminiService';

export interface GeneratedPanelImage {
    angle: 'aerial' | 'south' | 'west';
    description: string;
    prompt: string;
    imageUrl?: string; // Will be populated by frontend after generation
}

/**
 * Generate prompts for 3 different solar panel visualization angles
 */
export function generateSolarPanelImagePrompts(
    roofData: AIRoofAnalysis,
    address: string
): GeneratedPanelImage[] {
    const baseContext = `
Location: ${address}
Roof specifications:
- ${roofData.roofAreaSqMeters}m² total area
- ${roofData.roofPitchDegrees}° pitch
- ${roofData.orientation} facing
- ${roofData.shadingLevel} shading
- ${roofData.estimatedPanelCount} solar panels (400W each, dark blue/black)
- Obstacles: ${roofData.obstacles.join(', ') || 'none'}
`;

    return [
        {
            angle: 'aerial',
            description: 'Aerial view showing the complete solar panel layout on your roof',
            prompt: `Create a photorealistic aerial view (45-degree angle from above, like satellite imagery) of a residential house in Prince Edward Island, Canada with solar panels installed on the roof.

${baseContext}

Visual requirements:
- Typical PEI residential architecture (vinyl siding, asphalt shingles)
- ${roofData.estimatedPanelCount} dark blue/black solar panels arranged in neat rows
- Panels cover approximately ${roofData.usableAreaPercentage}% of the visible roof area
- 3-foot setback from all roof edges (fire code compliance)
- Surrounding environment: green lawn, some trees at a distance, neighboring houses visible
- Clear or partly cloudy sky (good solar conditions)
- Professional installation quality with proper alignment and spacing
- Realistic shadows and lighting showing it's a sunny day
- Maritime Canada coastal environment aesthetic

Style: Photorealistic architectural visualization, bright daylight, high quality, professional real estate photography style`,
        },
        {
            angle: 'south',
            description: 'Ground-level view from the south showing the panel face and installation details',
            prompt: `Create a photorealistic ground-level view from the south side of a residential house in Prince Edward Island, Canada, showing solar panels installed on the roof.

${baseContext}

Visual requirements:
- View from ground level looking up at the ${roofData.orientation}-facing roof section
- ${roofData.estimatedPanelCount} dark blue/black solar panels clearly visible
- Panels tilted at ${roofData.optimalTiltAngle}° angle (optimal for PEI latitude)
- Show the full face of the solar panels catching sunlight
- Typical PEI home: 1-2 story, vinyl siding, well-maintained
- Visible mounting hardware and racking system (professional installation)
- ${roofData.obstacles.length > 0 ? `Roof obstacles visible: ${roofData.obstacles.join(', ')}` : 'Clean roof installation'}
- Front yard with grass, driveway, maritime coastal vegetation
- Blue sky with some white clouds
- Realistic reflections on panel surfaces showing they're active

Style: Photorealistic, professional installation photography, bright daylight, showcasing the quality and scale of the installation`,
        },
        {
            angle: 'west',
            description: 'Side perspective view showing the panel profile and roof integration',
            prompt: `Create a photorealistic side view from the west of a residential house in Prince Edward Island, Canada, showing solar panels installed on the roof from a side perspective.

${baseContext}

Visual requirements:
- Side angle view showing the profile of the solar panel installation
- ${roofData.estimatedPanelCount} panels visible from the side
- Clear view of the ${roofData.roofPitchDegrees}° roof pitch with panels following the roof angle
- Show how panels integrate with the existing roof structure
- Typical PEI residential home with Atlantic Canada architectural style
- Side yard visible with some landscaping
- Panels appear as a sleek, modern addition to the home
- ${roofData.shadingLevel === 'low' ? 'Minimal tree coverage, excellent sun exposure' : roofData.shadingLevel === 'medium' ? 'Some trees nearby but not blocking panels' : 'Trees visible but panels positioned to minimize shading'}
- Afternoon lighting showing panels from the side
- Professional installation with clean lines and proper mounting

Style: Photorealistic architectural photography, golden hour lighting, showing the aesthetic appeal and professional quality of the installation`,
        },
    ];
}

/**
 * Get a simple description for each angle (for fallback display)
 */
export function getAngleDescriptions(): Record<'aerial' | 'south' | 'west', string> {
    return {
        aerial: 'Bird\'s eye view showing complete panel layout and roof coverage',
        south: 'Front view displaying panel face, tilt angle, and installation quality',
        west: 'Side perspective showing roof integration and profile',
    };
}
