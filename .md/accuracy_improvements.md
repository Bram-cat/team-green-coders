# Solar Panel Accuracy Improvements
## Better Alternatives to AI-Generated Images

**Last Updated:** January 2026

---

## Why AI-Generated Images May Not Be Ideal

The DALL-E 3 multi-angle generation feature has significant limitations:
1. **Not the Same Building**: Generates SIMILAR houses, not your actual property
2. **Approximations**: Based on architectural description, not precise measurements
3. **Reduced Accuracy**: May introduce errors in roof area, orientation, obstacles
4. **Recommendation**: Real photos from multiple angles are always more accurate

---

## ✅ Better Alternatives for Accurate Analysis

### 1. **Multi-Photo Upload (BEST OPTION)**

**Encourage users to upload 2-3 real photos from different angles:**

```
Recommended Photo Angles:
📸 Front view (street level, straight-on)
📸 Side view (showing full length of house and roof pitch)
📸 Aerial/Drone view (from above, shows entire roof)
```

**User Upload Guidance UI:**
- Add visual examples showing good vs bad photo angles
- Provide a checklist: ☑️ Front ☑️ Side ☑️ Aerial
- Show sample photos with annotations
- Explain that 2-3 real photos > 1 photo + AI generations

**Implementation:**
```typescript
// Already implemented! Users can upload 1-3 images
// Just need better UI guidance on what angles to capture
```

---

### 2. **Interactive Roof Questionnaire**

**Add a detailed questionnaire to supplement image analysis:**

```typescript
interface RoofDetailsQuestionnaire {
  // Measurements (user can measure with tape measure or estimate)
  roofLength?: number;  // meters or feet
  roofWidth?: number;   // meters or feet
  hasMultipleRoofPlanes?: boolean;
  numberOfRoofSections?: number;

  // Obstacles (more accurate than AI detection)
  hasChimney?: boolean;
  hasSkylight?: boolean;
  numberOfVents?: number;
  hasDormer?: boolean;

  // Shading (user knows their property best)
  treeShading: 'none' | 'morning' | 'afternoon' | 'all-day';
  nearbyBuildings?: boolean;

  // Orientation (user can use compass app)
  mainRoofFacing: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'southeast' | 'southwest' | 'northwest';

  // User's estimated roof pitch (can use smartphone level app)
  roofPitchEstimate?: 'flat' | 'low-slope' | 'medium' | 'steep';

  // Existing knowledge
  approximateRoofAge?: number;
  roofMaterial?: 'asphalt-shingles' | 'metal' | 'tile' | 'other';

  // Current solar usage (for validation)
  currentPanelCount?: number; // If they already have solar
}
```

**Benefits:**
- User knows their property better than AI
- Can measure/verify dimensions with tape measure
- Can use smartphone compass for orientation
- More accurate shading patterns (they live there!)

**UI Implementation:**
```tsx
// Step 1: Upload images
// Step 2: AI Analysis
// Step 3: OPTIONAL Questionnaire to refine estimates
//    "Help us improve accuracy - answer a few questions about your roof"
//    Each question is optional and pre-filled with AI estimates
//    User can override AI values with their own measurements
```

---

### 3. **Google Maps / Satellite API Integration**

**Use real aerial imagery instead of AI-generated images:**

```typescript
// Option A: Google Maps Static API
const satelliteImageUrl = `https://maps.googleapis.com/maps/api/staticmap?
  center=${address.lat},${address.lon}
  &zoom=20
  &size=800x800
  &maptype=satellite
  &key=${GOOGLE_MAPS_API_KEY}`;

// Option B: Mapbox Satellite API
const mapboxSatelliteUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/
  ${address.lon},${address.lat},19,0/800x800
  ?access_token=${MAPBOX_TOKEN}`;
```

**Benefits:**
- Real aerial view of ACTUAL property
- Shows exact roof dimensions and layout
- Detects obstacles (chimneys, vents, skylights)
- Better than AI-generated "similar" house
- Can measure roof area directly from satellite view

**Implementation Steps:**
1. Get user's address (already collected)
2. Geocode to lat/lon (already doing this!)
3. Fetch satellite image from Google/Mapbox
4. Run OpenAI Vision on satellite image as "aerial view"
5. Combine: ground-level photo + satellite aerial photo

**Cost:**
- Google Maps Static API: $2 per 1,000 requests (very affordable)
- Mapbox: Free tier includes 200,000 requests/month

---

### 4. **Manual Override Fields**

**Allow users to manually input/correct AI estimates:**

```tsx
<div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
  <h3 className="font-bold text-amber-900 mb-4">
    🔧 Refine AI Estimates (Optional)
  </h3>
  <p className="text-sm text-amber-800 mb-6">
    Our AI estimated these values from your photo. If you have exact measurements, you can override them here for better accuracy.
  </p>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="text-sm font-semibold">Roof Area (m²)</label>
      <input
        type="number"
        value={roofArea}
        onChange={(e) => setRoofArea(Number(e.target.value))}
        className="w-full border rounded px-3 py-2"
      />
      <p className="text-xs text-amber-700 mt-1">
        AI estimated: {aiEstimate.roofArea} m²
      </p>
    </div>

    <div>
      <label className="text-sm font-semibold">Usable Area (%)</label>
      <input
        type="number"
        min="40"
        max="95"
        value={usableArea}
        onChange={(e) => setUsableArea(Number(e.target.value))}
        className="w-full border rounded px-3 py-2"
      />
      <p className="text-xs text-amber-700 mt-1">
        AI estimated: {aiEstimate.usableArea}%
      </p>
    </div>

    <div>
      <label className="text-sm font-semibold">Panel Count Estimate</label>
      <input
        type="number"
        value={panelCount}
        onChange={(e) => setPanelCount(Number(e.target.value))}
        className="w-full border rounded px-3 py-2"
      />
      <p className="text-xs text-amber-700 mt-1">
        AI estimated: {aiEstimate.panelCount} panels
      </p>
    </div>

    <div>
      <label className="text-sm font-semibold">Roof Orientation</label>
      <select
        value={orientation}
        onChange={(e) => setOrientation(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="south">South</option>
        <option value="southwest">Southwest</option>
        <option value="southeast">Southeast</option>
        <option value="east">East</option>
        <option value="west">West</option>
        <option value="north">North</option>
      </select>
      <p className="text-xs text-amber-700 mt-1">
        AI detected: {aiEstimate.orientation}
      </p>
    </div>
  </div>
</div>
```

**Benefits:**
- User can measure their own roof with tape measure
- User knows obstacles better than AI
- User can verify with property documents
- Builds trust ("AI got it wrong, but I can fix it")

---

### 5. **Improved Photo Upload Guidance**

**Add helper UI BEFORE upload to guide users:**

```tsx
<div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
  <h3 className="text-2xl font-bold text-blue-900 mb-4">
    📸 Photo Tips for Best Accuracy
  </h3>

  <div className="grid md:grid-cols-3 gap-6">
    <PhotoGuidanceCard
      icon="🏠"
      title="Front/Street View"
      description="Stand across the street, capture entire house and roof"
      tips={[
        "Full house visible",
        "Clear roof outline",
        "Bright daylight",
        "No obstructions"
      ]}
      example="/img/guide-front-view.jpg"
    />

    <PhotoGuidanceCard
      icon="📐"
      title="Side View"
      description="Shows roof pitch and length accurately"
      tips={[
        "Full side profile",
        "Shows roof angle",
        "All panels would fit",
        "Clear edge-to-edge"
      ]}
      example="/img/guide-side-view.jpg"
    />

    <PhotoGuidanceCard
      icon="🛰️"
      title="Aerial/Drone (BEST)"
      description="Overhead view shows exact roof area"
      tips={[
        "Directly above",
        "Entire roof visible",
        "Can count sections",
        "See all obstacles"
      ]}
      example="/img/guide-aerial-view.jpg"
    />
  </div>

  <div className="mt-6 p-4 bg-white rounded-xl">
    <p className="text-sm text-blue-800">
      <strong>💡 Pro Tip:</strong> Use Google Maps satellite view if you don't have a drone.
      Screenshot your roof and upload it as the "aerial view"!
    </p>
  </div>
</div>
```

---

### 6. **Real-Time Validation & Feedback**

**Show confidence scores and warnings:**

```tsx
{aiConfidence < 60 && (
  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 flex items-start gap-4">
    <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
    <div>
      <h4 className="font-bold text-yellow-900 mb-2">
        ⚠️ Low Confidence Analysis ({aiConfidence}%)
      </h4>
      <p className="text-yellow-800 mb-4">
        Our AI had difficulty analyzing your photo. Results may be less accurate.
      </p>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-yellow-900">To improve accuracy:</p>
        <ul className="text-sm text-yellow-800 space-y-1 ml-4">
          <li>✓ Upload additional photos from different angles</li>
          <li>✓ Use photos taken in bright daylight</li>
          <li>✓ Ensure entire roof is visible and in focus</li>
          <li>✓ Manually verify the estimates below</li>
        </ul>
      </div>
    </div>
  </div>
)}
```

---

### 7. **Comparison with PEI Averages**

**Validate estimates against known PEI data:**

```tsx
<div className="bg-gray-50 rounded-2xl p-6">
  <h4 className="font-bold mb-4">📊 How Your Roof Compares to PEI Averages</h4>

  <div className="space-y-4">
    <ComparisonRow
      label="Roof Area"
      yourValue={roofArea}
      averageValue={100}
      unit="m²"
      range="60-180 m²"
      warning={roofArea > 150 ? "Unusually large for residential PEI" : undefined}
    />

    <ComparisonRow
      label="Panel Count"
      yourValue={panelCount}
      averageValue={18}
      unit="panels"
      range="12-24 panels"
      warning={panelCount > 25 ? "Above typical residential range" : undefined}
    />

    <ComparisonRow
      label="System Size"
      yourValue={systemSize}
      averageValue={7.2}
      unit="kW"
      range="4.8-9.6 kW"
      warning={systemSize > 10 ? "Above typical residential range" : undefined}
    />
  </div>
</div>
```

---

## 🎯 Recommended Implementation Priority

### Phase 1: Quick Wins (This Week)
1. **Disable auto-generated images by default** ✅
2. **Add input field for monthly bill** (already done!)
3. **Improve photo upload guidance UI**
4. **Add manual override fields for key estimates**

### Phase 2: Medium Effort (Next 2 Weeks)
5. **Integrate Google Maps Satellite API** for real aerial views
6. **Add interactive roof questionnaire** (optional step)
7. **Real-time validation warnings** for unusual estimates

### Phase 3: Advanced (Future)
8. **AR measurement tool** (use smartphone camera + ARKit/ARCore)
9. **Professional installer verification** (optional paid service)
10. **Machine learning on PEI-specific roof data** (train on local properties)

---

## 🔧 Technical Implementation Notes

### Disable Auto-Generation (Immediate Fix)

```typescript
// In src/app/api/analyze/route.ts
// Comment out or add a feature flag

const AUTO_GENERATE_ENABLED = false; // Set to false by default

if (images.length === 1 && AUTO_GENERATE_ENABLED) {
  // ... existing generation code
}
```

### Add Feature Flag for Testing

```typescript
// In .env
ENABLE_IMAGE_GENERATION=false

// In code
if (images.length === 1 && process.env.ENABLE_IMAGE_GENERATION === 'true') {
  // Only generate if explicitly enabled
}
```

---

## 📝 Conclusion

**Best Accuracy Strategy:**
1. ✅ Encourage 2-3 real photos from different angles
2. ✅ Integrate satellite imagery from Google Maps
3. ✅ Add optional questionnaire for user verification
4. ✅ Provide manual override fields
5. ✅ Show confidence scores and warnings
6. ❌ Disable AI-generated images (they reduce accuracy)

**Result:** More accurate estimates without relying on approximations!
