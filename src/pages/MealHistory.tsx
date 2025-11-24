import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const MealHistory = () => {
  const mealsByDay = [
    {
      date: "Today, November 22",
      totalCalories: 1850,
      meals: [
        { name: "Breakfast", time: "8:30 AM", calories: 420, image: "🥑" },
        { name: "Lunch", time: "1:00 PM", calories: 680, image: "🍔" },
        { name: "Snack", time: "4:30 PM", calories: 150, image: "🍎" },
        { name: "Dinner", time: "7:00 PM", calories: 600, image: "🍝" }
      ]
    },
    {
      date: "Yesterday, November 21",
      totalCalories: 1650,
      meals: [
        { name: "Breakfast", time: "8:00 AM", calories: 380, image: "🥞" },
        { name: "Lunch", time: "12:30 PM", calories: 550, image: "🥗" },
        { name: "Dinner", time: "6:45 PM", calories: 720, image: "🍗" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <Link to="/progress">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Meal History</h1>
          <Button variant="ghost" size="icon">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {mealsByDay.map((day, dayIndex) => (
          <div key={dayIndex}>
            {/* Day Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">{day.date}</span>
              </div>
              <div className="bg-card px-4 py-1.5 rounded-full border border-border">
                <span className="text-sm font-semibold">{day.totalCalories} cal</span>
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-3">
              {day.meals.map((meal, mealIndex) => (
                <div
                  key={mealIndex}
                  className="bg-card rounded-3xl p-5 shadow-card border border-border hover:border-primary transition-smooth cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Meal Image/Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
                      {meal.image}
                    </div>

                    {/* Meal Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{meal.name}</h3>
                      <p className="text-sm text-muted-foreground">{meal.time}</p>
                    </div>

                    {/* Calories */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{meal.calories}</p>
                      <p className="text-xs text-muted-foreground">calories</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Load More */}
        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 border-border hover:border-primary transition-smooth"
        >
          Load More Days
        </Button>
      </div>
    </div>
  );
};

export default MealHistory;
