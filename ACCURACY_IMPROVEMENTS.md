# Additional Data to Collect for Improved Accuracy

## Currently Collected Data ✅
- Roof image
- Address (street, city, postal code)
- Monthly electricity bill
- Panel type preference (standard/premium/high-efficiency)
- Roof material (asphalt/metal/tile)
- Shade patterns (morning/afternoon/seasonal)

## Recommended Additional Data to Collect

### 1. **Roof Specifications** (High Impact)
- [ ] **Roof Age**: Years since installation/replacement
  - *Why*: Older roofs may need replacement before solar, affects mounting costs
  - *Input*: Dropdown (0-5 years, 5-10, 10-15, 15-20, 20+ years)

- [ ] **Roof Type**:
  - *Options*: Gable, Hip, Flat, Gambrel, Mansard, Shed
  - *Why*: Affects installation complexity and panel placement strategies

- [ ] **Number of Roof Planes**:
  - *Input*: Number input (1-10)
  - *Why*: More planes = more complex installation = higher cost

### 2. **Property Details** (Medium Impact)
- [ ] **Number of Stories**:
  - *Options*: 1, 1.5, 2, 2.5, 3+
  - *Why*: Affects installation labor costs and safety requirements

- [ ] **Home Square Footage**:
  - *Input*: Number (500-10,000 sq ft)
  - *Why*: Better estimate of roof size if image analysis is uncertain

- [ ] **Property Orientation**:
  - *Input*: Compass direction of front of house
  - *Why*: Helps determine which roof plane faces south

### 3. **Energy Usage Details** (High Impact)
- [ ] **Annual Electricity Consumption** (kWh):
  - *Input*: Number or upload bill
  - *Why*: More accurate than monthly bill due to seasonal variations
  - *Current*: We calculate from monthly bill, but actual usage is better

- [ ] **Heating/Cooling Type**:
  - *Options*: Electric, Gas, Oil, Heat Pump, Mixed
  - *Why*: Electric heating = higher winter consumption = need bigger system

- [ ] **Electric Vehicle**:
  - *Input*: Yes/No + planned purchase year
  - *Why*: EV charging adds 3-4 kW demand, need larger system

- [ ] **Future Plans**:
  - Heat pump installation planned
  - Pool/hot tub planned
  - Home addition planned
  - *Why*: Size system for future needs, not just current

### 4. **Site Conditions** (Medium Impact)
- [ ] **Tree Coverage**:
  - *Options*: None, Light (1-2 nearby trees), Moderate (3-5), Heavy (6+), Forested
  - *Why*: More accurate shading assessment than AI image analysis alone

- [ ] **Tree Types**:
  - *Options*: Deciduous (leaves fall), Evergreen (year-round), Mixed
  - *Why*: Deciduous trees only shade in summer, evergreens year-round

- [ ] **Distance to Trees**:
  - *Options*: <10m, 10-20m, 20-50m, 50m+
  - *Why*: Closer trees = more shading = bigger impact

- [ ] **Surrounding Building Heights**:
  - *Options*: Single-story neighbors, Two-story, Three-story+
  - *Why*: Tall buildings nearby can shade roof mornings/evenings

### 5. **Installation Preferences** (Low Impact, but useful)
- [ ] **Budget Range**:
  - *Options*: <$15k, $15-25k, $25-35k, $35k+, No limit
  - *Why*: Tailor recommendations to realistic budget

- [ ] **Financing Preference**:
  - *Options*: Cash, Loan, Lease, PPA (Power Purchase Agreement)
  - *Why*: Different financial products available

- [ ] **Timeline**:
  - *Options*: ASAP, 3-6 months, 6-12 months, 1-2 years, Just exploring
  - *Why*: Helps prioritize recommendations

- [ ] **Primary Goal**:
  - *Options*: Reduce bills, Environmental impact, Energy independence, Increase home value
  - *Why*: Tailor explanation and recommendations to user motivations

### 6. **Historical Utility Data** (High Impact)
- [ ] **Upload Past 12 Months of Bills** (PDF/CSV):
  - *Why*: See seasonal consumption patterns
  - *Impact*: Much more accurate system sizing than single month

- [ ] **Average Winter Bill**:
  - *Input*: Dollar amount
  - *Why*: PEI has significant seasonal variation

- [ ] **Average Summer Bill**:
  - *Input*: Dollar amount
  - *Why*: Combined with winter, shows consumption pattern

### 7. **Existing System Details** (For "Improve" Feature Only)
- [ ] **Installation Year**:
  - *Input*: Year (2000-2024)
  - *Why*: Older systems less efficient, may need upgrades

- [ ] **Inverter Type**:
  - *Options*: String, Microinverters, Power Optimizers, Don't Know
  - *Why*: Affects upgrade recommendations

- [ ] **Known Issues**:
  - *Checkboxes*: Shading problems, Frequent failures, Low production, Monitoring not working
  - *Why*: Focus improvement recommendations on pain points

- [ ] **Monitoring Data Access**:
  - *Input*: Yes/No + system login (optional)
  - *Why*: Could analyze actual production vs expected

## Priority Ranking for Implementation

### Phase 1 (Quick Wins - Add to Current Form):
1. ✅ Monthly electricity bill (already collected)
2. **Annual electricity consumption** (alternative to monthly bill)
3. **Electric vehicle** (yes/no)
4. **Tree coverage level** (dropdown)
5. **Roof age range** (dropdown)

### Phase 2 (Enhanced Accuracy):
1. **Multi-image upload** (3 images max)
2. **Number of roof planes**
3. **Heating/cooling type**
4. **Tree types** (deciduous/evergreen)
5. **Number of stories**

### Phase 3 (Advanced Features):
1. **Upload utility bills** (12 months)
2. **Future plans** (EV, heat pump, etc.)
3. **Budget range**
4. **Property orientation**
5. **Monitoring data access** (for Improve feature)

## Expected Accuracy Improvements

| Data Point | Accuracy Improvement | Implementation Effort |
|------------|---------------------|----------------------|
| Annual consumption (vs monthly) | +10-15% | Low (1 field) |
| Multi-image upload (3 angles) | +15-20% | High (API changes) |
| Electric vehicle plans | +10-12% | Low (1 checkbox) |
| Tree coverage + types | +8-12% | Low (2 dropdowns) |
| 12-month utility bills | +20-25% | Medium (file upload) |
| Heating/cooling type | +5-8% | Low (1 dropdown) |
| Roof age + planes | +5-7% | Low (2 fields) |

## Total Potential Improvement
Implementing Phase 1 + Phase 2 could improve accuracy by **35-50%** over current estimates.
