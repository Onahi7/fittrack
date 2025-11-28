import { useMemo } from "react";
import { MacroRing } from "./MacroRing";
import { Meal } from "@/hooks/useFirestore";

interface MacroDashboardProps {
  meals: Meal[];
  targets?: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

const DEFAULT_TARGETS = {
  protein: 150,
  carbs: 200,
  fats: 60,
};

export const MacroDashboard = ({ meals, targets = DEFAULT_TARGETS }: MacroDashboardProps) => {
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fat || 0),
        calories: acc.calories + (meal.calories || 0),
      }),
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );
  }, [meals]);

  return (
    <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
      <h2 className="text-xl font-semibold mb-6">Today's Macros</h2>
      
      {/* Macro Rings */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MacroRing
          label="Protein"
          current={totals.protein}
          target={targets.protein}
          color="#10b981"
        />
        <MacroRing
          label="Carbs"
          current={totals.carbs}
          target={targets.carbs}
          color="#f59e0b"
        />
        <MacroRing
          label="Fats"
          current={totals.fats}
          target={targets.fats}
          color="#ef4444"
        />
      </div>

      {/* Calories Summary */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Calories</p>
            <p className="text-3xl font-bold text-primary">{Math.round(totals.calories)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">From macros</p>
            <p className="text-sm font-medium">
              P: {Math.round((totals.protein * 4 / totals.calories) * 100 || 0)}% • 
              C: {Math.round((totals.carbs * 4 / totals.calories) * 100 || 0)}% • 
              F: {Math.round((totals.fats * 9 / totals.calories) * 100 || 0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
