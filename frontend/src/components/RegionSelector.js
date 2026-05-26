import React from "react";
import { Globe } from "lucide-react";
import { useRegionalPricing } from "../context/RegionalPricingContext";

const RegionSelector = () => {
  const { currentRegion, allRegions, changeRegion, isLoading } = useRegionalPricing();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-slate-600">
        <Globe className="h-4 w-4 animate-spin" />
        <span>Detecting location...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3" data-testid="region-selector">
      <div className="flex items-center space-x-2 text-sm text-slate-600">
        <Globe className="h-4 w-4" />
        <span>Region:</span>
      </div>
      <select
        value={currentRegion}
        onChange={(e) => changeRegion(e.target.value)}
        data-testid="region-selector-select"
        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm focus:border-orange-400 focus:ring-orange-400 focus:outline-none"
      >
        {Object.entries(allRegions).map(([code, config]) => (
          <option key={code} value={code}>
            {config.name} ({config.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};

export default RegionSelector;
