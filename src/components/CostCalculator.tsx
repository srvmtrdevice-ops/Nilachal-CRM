import React, { useState, useEffect } from "react";
import { Calculator, Sparkles, Sliders, CheckSquare, Layers, DollarSign } from "lucide-react";

interface CostCalculatorProps {
  onApplyBudget?: (calculatedTotal: number) => void;
  initialBudget?: number;
}

export default function CostCalculator({ onApplyBudget, initialBudget }: CostCalculatorProps) {
  const [area, setArea] = useState(1200); // sq.ft.
  const [designStyle, setDesignStyle] = useState<"minimal" | "modern" | "luxury" | "royal">("modern");
  
  // Toggles for active scope
  const [kitchen, setKitchen] = useState(true);
  const [kitchenPremium, setKitchenPremium] = useState("premium"); // luxury or standard
  
  const [wardrobes, setWardrobes] = useState(true);
  const [wardrobeCount, setWardrobeCount] = useState(2);
  
  const [falseCeiling, setFalseCeiling] = useState(true);
  const [falseCeilingArea, setFalseCeilingArea] = useState(80); // percentage of floor area
  
  const [painting, setPainting] = useState(true);
  const [paintQuality, setPaintQuality] = useState("premium"); // standard, premium, royale-texture
  
  const [flooring, setFlooring] = useState(false);
  const [flooringType, setFlooringType] = useState("vitrified"); // vitrified, wooden, marble

  const [lighting, setLighting] = useState(true);

  // Calculated estimates
  const [breakdown, setBreakdown] = useState({
    designFee: 0,
    kitchenCost: 0,
    wardrobeCost: 0,
    ceilingCost: 0,
    paintCost: 0,
    floorCost: 0,
    lightingCost: 0,
    total: 0,
  });

  const rates = {
    minimal: { base: 120, design: 50 },
    modern: { base: 180, design: 80 },
    luxury: { base: 320, design: 150 },
    royal: { base: 450, design: 220 },
  };

  useEffect(() => {
    // 1. Design & Consultation Fee (based on selected design style & area)
    const designFee = area * rates[designStyle].design;

    // 2. Modular Kitchen Estimate
    let kitchenCost = 0;
    if (kitchen) {
      if (kitchenPremium === "standard") kitchenCost = 150000;
      else if (kitchenPremium === "premium") kitchenCost = 280000;
      else kitchenCost = 450000; // luxury
    }

    // 3. Wardrobe Estimate
    let wardrobeCost = 0;
    if (wardrobes) {
      wardrobeCost = wardrobeCount * 75000; // average 75k per 4x7 sliding wardrobe
    }

    // 4. False Ceiling (Area % * overall sqft * rate)
    let ceilingCost = 0;
    if (falseCeiling) {
      const ceilingSqFt = area * (falseCeilingArea / 100);
      ceilingCost = ceilingSqFt * 110; // Rate of 110 per sqft for gypsum + lights cutouts
    }

    // 5. Painting
    let paintCost = 0;
    if (painting) {
      const wallAreaMultiplier = 3.5; // Wall area is roughly 3.5 times floor area
      const paintSqFt = area * wallAreaMultiplier;
      let ratePerSqFt = 18; // standard
      if (paintQuality === "premium") ratePerSqFt = 32;
      else if (paintQuality === "royale-texture") ratePerSqFt = 55;
      
      paintCost = paintSqFt * ratePerSqFt;
    }

    // 6. Flooring
    let floorCost = 0;
    if (flooring) {
      let floorRate = 90; // vitrified
      if (flooringType === "wooden") floorRate = 180;
      else if (flooringType === "marble") floorRate = 420; // Italian marble

      floorCost = area * floorRate;
    }

    // 7. Lighting and electrical
    let lightingCost = 0;
    if (lighting) {
      lightingCost = area * 45; // average 45 Rs per sqft for smart fixtures & panels
    }

    // 8. Total
    const total = designFee + kitchenCost + wardrobeCost + ceilingCost + paintCost + floorCost + lightingCost;

    setBreakdown({
      designFee,
      kitchenCost,
      wardrobeCost,
      ceilingCost,
      paintCost,
      floorCost,
      lightingCost,
      total,
    });
  }, [area, designStyle, kitchen, kitchenPremium, wardrobes, wardrobeCount, falseCeiling, falseCeilingArea, painting, paintQuality, flooring, flooringType, lighting]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-medium text-sm tracking-wider uppercase mb-1">
            <Calculator className="w-4 h-4" /> Smart Estimator
          </div>
          <h2 className="text-2xl font-serif text-stone-100 font-semibold">Interactive Budget Planner</h2>
        </div>
        {onApplyBudget && (
          <button
            onClick={() => onApplyBudget(breakdown.total)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-medium rounded-lg text-sm transition-all duration-200 hover:shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Apply Estimate to Budget
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT PANEL */}
        <div className="lg:col-span-7 space-y-6">
          {/* Floor Area Slider */}
          <div className="space-y-2 bg-stone-950 p-4 rounded-xl border border-stone-800/80">
            <div className="flex justify-between items-center">
              <label className="text-stone-300 font-medium text-sm flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500/80" /> Carpet Area (Sq. Ft.)
              </label>
              <span className="text-amber-500 font-mono font-semibold text-base">{area} sq.ft.</span>
            </div>
            <input
              type="range"
              min="300"
              max="6000"
              step="50"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-stone-500">
              <span>Studio (300)</span>
              <span>2 BHK (1000)</span>
              <span>3 BHK (1500)</span>
              <span>Villa (3000+)</span>
            </div>
          </div>

          {/* Design Style Selector */}
          <div className="space-y-3">
            <label className="text-stone-300 font-medium text-sm">Interior Design Aesthetic Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["minimal", "modern", "luxury", "royal"] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setDesignStyle(style)}
                  className={`py-3 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all duration-200 text-center ${
                    designStyle === style
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/60 shadow-md"
                      : "bg-stone-950 text-stone-400 border-stone-800/60 hover:border-stone-700 hover:text-stone-300"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Controls */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Custom Work Scope</h3>

            {/* Kitchen Modular Toggle */}
            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/60 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kitchen}
                    onChange={(e) => setKitchen(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  <span className="text-stone-200 text-sm font-medium">Modular Kitchen Setup</span>
                </label>
                {kitchen && (
                  <span className="text-stone-400 font-mono text-xs">{formatCurrency(breakdown.kitchenCost)}</span>
                )}
              </div>
              {kitchen && (
                <div className="flex gap-2 pl-6 mt-1">
                  {["standard", "premium", "luxury"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setKitchenPremium(level)}
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${
                        kitchenPremium === level
                          ? "bg-amber-500 text-stone-950 border-amber-500"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wardrobes Toggle */}
            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/60 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wardrobes}
                    onChange={(e) => setWardrobes(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  <span className="text-stone-200 text-sm font-medium">Modular Wardrobes & Storage</span>
                </label>
                {wardrobes && (
                  <span className="text-stone-400 font-mono text-xs">{formatCurrency(breakdown.wardrobeCost)}</span>
                )}
              </div>
              {wardrobes && (
                <div className="flex items-center gap-4 pl-6">
                  <span className="text-xs text-stone-400">Number of wardrobes:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setWardrobeCount(Math.max(1, wardrobeCount - 1))}
                      className="w-7 h-7 bg-stone-800 rounded flex items-center justify-center text-stone-200 hover:bg-stone-700"
                    >
                      -
                    </button>
                    <span className="text-sm font-mono text-stone-100 w-4 text-center">{wardrobeCount}</span>
                    <button
                      type="button"
                      onClick={() => setWardrobeCount(Math.min(10, wardrobeCount + 1))}
                      className="w-7 h-7 bg-stone-800 rounded flex items-center justify-center text-stone-200 hover:bg-stone-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* False Ceiling */}
            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/60 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={falseCeiling}
                    onChange={(e) => setFalseCeiling(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  <span className="text-stone-200 text-sm font-medium">False Ceiling & Gypsum board work</span>
                </label>
                {falseCeiling && (
                  <span className="text-stone-400 font-mono text-xs">{formatCurrency(breakdown.ceilingCost)}</span>
                )}
              </div>
              {falseCeiling && (
                <div className="pl-6 space-y-1">
                  <div className="flex justify-between text-xs text-stone-400">
                    <span>Ceiling coverage:</span>
                    <span className="text-amber-500 font-mono">{falseCeilingArea}% of carpet area</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="10"
                    value={falseCeilingArea}
                    onChange={(e) => setFalseCeilingArea(Number(e.target.value))}
                    className="w-full h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Painting Quality */}
            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/60 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={painting}
                    onChange={(e) => setPainting(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  <span className="text-stone-200 text-sm font-medium">Premium Painting & Emulsion Walls</span>
                </label>
                {painting && (
                  <span className="text-stone-400 font-mono text-xs">{formatCurrency(breakdown.paintCost)}</span>
                )}
              </div>
              {painting && (
                <div className="flex gap-2 pl-6 mt-1">
                  {["standard", "premium", "royale-texture"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPaintQuality(level)}
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${
                        paintQuality === level
                          ? "bg-amber-500 text-stone-950 border-amber-500"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                      }`}
                    >
                      {level.replace("-", " ")}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Flooring Selector */}
            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/60 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flooring}
                    onChange={(e) => setFlooring(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                  />
                  <span className="text-stone-200 text-sm font-medium">New Floor Tiling / Wooden / Marble</span>
                </label>
                {flooring && (
                  <span className="text-stone-400 font-mono text-xs">{formatCurrency(breakdown.floorCost)}</span>
                )}
              </div>
              {flooring && (
                <div className="flex gap-2 pl-6 mt-1">
                  {["vitrified", "wooden", "marble"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFlooringType(level)}
                      className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${
                        flooringType === level
                          ? "bg-amber-500 text-stone-950 border-amber-500"
                          : "bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Lights */}
            <div className="p-4 bg-stone-950/60 rounded-xl border border-stone-800/60 flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lighting}
                  onChange={(e) => setLighting(e.target.checked)}
                  className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0 focus:ring-offset-0 w-4 h-4"
                />
                <span className="text-stone-200 text-sm font-medium">Ambient Designer Lighting & Fittings</span>
              </label>
              {lighting && (
                <span className="text-stone-400 font-mono text-xs">{formatCurrency(breakdown.lightingCost)}</span>
              )}
            </div>
          </div>
        </div>

        {/* PRICE SUMMARY CARD */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-1">
              <Layers className="w-4 h-4" /> Cost Estimation Summary
            </h3>

            <div className="space-y-4 divide-y divide-stone-900">
              <div className="flex justify-between text-xs pt-1">
                <span className="text-stone-400">Design & Supervision (consultation)</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.designFee)}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-stone-400">Modular Kitchen setup</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.kitchenCost)}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-stone-400">Wardrobes & closets ({wardrobeCount} nos.)</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.wardrobeCost)}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-stone-400">Gypsum False Ceiling ({falseCeilingArea}% area)</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.ceilingCost)}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-stone-400">High-End Wall Painting ({paintQuality})</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.paintCost)}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-stone-400">Custom Flooring ({flooringType})</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.floorCost)}</span>
              </div>
              <div className="flex justify-between text-xs pt-3">
                <span className="text-stone-400">Designer Lighting & Electrical</span>
                <span className="text-stone-200 font-mono">{formatCurrency(breakdown.lightingCost)}</span>
              </div>

              {/* Total estimation */}
              <div className="pt-5 mt-4 border-t border-stone-800 flex justify-between items-baseline">
                <span className="text-stone-300 font-bold text-base">Grand Total</span>
                <div className="text-right">
                  <div className="text-2xl font-serif text-amber-500 font-bold">{formatCurrency(breakdown.total)}</div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">Estimated (All-inclusive, taxes extra)</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="mt-6 bg-stone-900/60 p-3 rounded-lg border border-stone-800 text-[10.5px] text-stone-400 leading-relaxed">
              * Rates are estimated averages for Nilachal Creatives based on localized material availability, standard premium laminates, and professional carpentry. Actual project quotation may vary based on exact measurements and wood board selections.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
