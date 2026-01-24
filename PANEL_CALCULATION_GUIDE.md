# Solar Panel Calculation Guide - PEI Residential

## Fixed Calculation Logic

### Problem Identified
Previous system was giving identical panel counts (18-20) for very different roof sizes because it used **2.04 m² per panel** spacing, which is unrealistic.

### Solution Implemented
Now using **5.5 m² of usable roof area per panel** to account for:
- Panel physical size: 1.7 m²
- Fire code setbacks: 0.9m from all edges
- Maintenance walkways: 0.6-0.9m between rows
- Row spacing to prevent shading
- Irregular roof shapes and obstacles

---

## Realistic Panel Count Tiers

| Usable Roof Area | Panel Count | System Size | Annual Production | Example |
|-----------------|-------------|-------------|-------------------|---------|
| 30-49 m² | 5-8 panels | 2.0-3.2 kW | 2,918-4,669 kWh | Small cottage |
| **50-59 m²** | **8-10 panels** | **3.2-4.0 kW** | **4,669-5,836 kWh** | **Small home** |
| **60-69 m²** | **11-13 panels** | **4.4-5.2 kW** | **6,420-7,587 kWh** | **Average home** |
| **70-79 m²** | **13-15 panels** | **5.2-6.0 kW** | **7,587-8,754 kWh** | **Standard 2-story** |
| **80-89 m²** | **15-17 panels** | **6.0-6.8 kW** | **8,754-9,921 kWh** | **Large 2-story** |
| 90-99 m² | 17-19 panels | 6.8-7.6 kW | 9,921-11,088 kWh | Large home |
| 100-119 m² | 19-22 panels | 7.6-8.8 kW | 11,088-12,839 kWh | Very large home |
| 120-150 m² | 22-27 panels | 8.8-10.8 kW | 12,839-15,757 kWh | Estate/small farm |

---

## Expected Results for Test Images

### Image 1: Small Bungalow
- **Roof Area**: ~80-100 m² total
- **Usable Area**: ~56 m² (70% usable)
- **Expected Panels**: **9-10 panels** (not 18!)
- **System Size**: **3.6-4.0 kW**
- **Annual Production**: **5,252-5,836 kWh**
- **System Cost**: **$10,800-$12,000**
- **Annual Savings**: **$914-$1,015**

### Image 2: Medium Home
- **Roof Area**: ~95-110 m² total
- **Usable Area**: ~68 m² (70% usable)
- **Expected Panels**: **12-13 panels** (not 18!)
- **System Size**: **4.8-5.2 kW**
- **Annual Production**: **7,003-7,587 kWh**
- **System Cost**: **$14,400-$15,600**
- **Annual Savings**: **$1,219-$1,320**

### Image 3: Larger 2-Story
- **Roof Area**: ~115-130 m² total
- **Usable Area**: ~83 m² (70% usable)
- **Expected Panels**: **15-16 panels** (not 20!)
- **System Size**: **6.0-6.4 kW**
- **Annual Production**: **8,754-9,338 kWh**
- **System Cost**: **$18,000-$19,200**
- **Annual Savings**: **$1,523-$1,625**

---

## Calculation Formulas

### Panel Count
```
Panel Count = Math.floor(Usable Area ÷ 5.5)
Then apply tier caps based on usable area range
```

### System Size
```
System Size (kW) = Panel Count × 0.4 kW per panel
```

### Annual Production
```
Annual Production (kWh) = System Size (kW) × 1459 (PEI PV Potential)
```

### System Cost
```
System Cost ($) = System Size (kW) × 1000 × $3.00/watt
```

### Annual Savings
```
Annual Savings ($) = Annual Production (kWh) × $0.174/kWh (Maritime Electric rate)
Capped at user's annual electricity bill if provided
```

### Payback Period
```
Payback Period (years) = System Cost ÷ Annual Savings
```

### 25-Year Savings
```
Compound calculation with:
- 3% annual electricity rate increase
- 0.5% annual panel degradation
```

### ROI
```
ROI (%) = ((25-Year Savings - System Cost) ÷ System Cost) × 100
```

---

## Data Sources

- Panel specifications: Industry standard 400W, 1.7 m² panels
- PEI PV Potential: 1459 kWh/kWp ([calculation.json](calculation.json))
- Electricity rate: $0.174/kWh ([information.json](information.json))
- Installation cost: $3.00/W cash median ([information.json](information.json))
- Effective area per panel: Real-world installation practices
  - Source: [Solar Panel Square Footage Calculator](https://shopsolarkits.com/blogs/learning-center/solar-panel-square-footage-calculator)
  - Source: [How Many Solar Panels Can Fit On My Roof?](https://www.makemyhousegreen.com/green-guides/how-many-solar-panels-can-fit-on-my-roof)

---

## Key Changes Made

1. ✅ **Fixed panel count calculation** - Now uses 5.5 m² per panel instead of 2 m²
2. ✅ **Added realistic tiered limits** - Different roofs get different panel counts
3. ✅ **Removed image generation** - Focus on accurate calculations
4. ✅ **Enhanced AI vision prompt** - Better detection of windows, doors, obstacles
5. ✅ **Proper PEI methodology** - Uses actual 1459 kWh/kWp photovoltaic potential
6. ✅ **Validated with web research** - Matches industry installation practices

Now different houses will get **truly different results** based on their actual roof analysis!
