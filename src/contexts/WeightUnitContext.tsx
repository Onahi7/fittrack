import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type WeightUnit = 'lbs' | 'kg';

interface WeightUnitContextType {
  unit: WeightUnit;
  toggleUnit: () => void;
  setUnit: (unit: WeightUnit) => void;
  convertWeight: (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit) => number;
  formatWeight: (weight: number) => string;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

export function WeightUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>(() => {
    const saved = localStorage.getItem('weightUnit');
    return (saved === 'kg' || saved === 'lbs') ? saved : 'lbs';
  });

  useEffect(() => {
    localStorage.setItem('weightUnit', unit);
  }, [unit]);

  const toggleUnit = () => {
    setUnitState(prev => prev === 'lbs' ? 'kg' : 'lbs');
  };

  const setUnit = (newUnit: WeightUnit) => {
    setUnitState(newUnit);
  };

  const convertWeight = (weight: number, fromUnit: WeightUnit, toUnit: WeightUnit): number => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'lbs' && toUnit === 'kg') {
      return weight * LBS_TO_KG;
    }
    return weight * KG_TO_LBS;
  };

  const formatWeight = (weight: number): string => {
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <WeightUnitContext.Provider value={{ unit, toggleUnit, setUnit, convertWeight, formatWeight }}>
      {children}
    </WeightUnitContext.Provider>
  );
}

export function useWeightUnit() {
  const context = useContext(WeightUnitContext);
  if (!context) {
    throw new Error('useWeightUnit must be used within WeightUnitProvider');
  }
  return context;
}
