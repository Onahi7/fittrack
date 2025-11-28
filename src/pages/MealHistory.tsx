import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Filter, Utensils, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useMeals } from "@/hooks/useFirestore";
import { useState } from "react";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import { motion } from "framer-motion";

const MealHistory = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { meals, loading } = useMeals(selectedDate);

  // Group meals by date
  const mealsByDay = meals.reduce((acc: any[], meal: any) => {
    const mealDate = new Date(meal.createdAt);
    const dateStr = mealDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let dayGroup = acc.find(d => d.date === dateStr);
    if (!dayGroup) {
      dayGroup = { date: dateStr, totalCalories: 0, meals: [] };
      acc.push(dayGroup);
    }
    
    dayGroup.meals.push({
      name: meal.type || 'Meal',
      time: mealDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      calories: meal.calories || 0,
      image: meal.imageUrl || '🍽️',
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      notes: meal.notes || ""
    });
    dayGroup.totalCalories += meal.calories || 0;
    
    return acc;
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <Link to="/progress">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-heading">Meal History</h1>
            <Button variant="ghost" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card/50 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : mealsByDay.length === 0 ? (
            <div className="text-center py-12 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 font-heading">No meals logged yet</h3>
              <p className="text-muted-foreground mb-6 max-w-[200px] mx-auto">
                Start tracking your nutrition by logging your first meal.
              </p>
              <Link to="/log-meal">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                  Log a Meal
                </Button>
              </Link>
            </div>
          ) : (
            mealsByDay.map((day, dayIndex) => (
              <motion.div 
                key={dayIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/80 backdrop-blur-md py-2 z-10">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold font-heading">{day.date}</span>
                  </div>
                  <div className="bg-card/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border/50 shadow-sm">
                    <span className="text-sm font-semibold text-primary">{day.totalCalories} cal</span>
                  </div>
                </div>

                {/* Meals */}
                <div className="space-y-3">
                  {day.meals.map((meal, mealIndex) => (
                    <motion.div
                      key={mealIndex}
                      whileHover={{ scale: 1.02 }}
                      className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-card border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* Meal Image/Icon */}
                        <div className="w-20 h-20 rounded-2xl bg-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {typeof meal.image === 'string' && meal.image.startsWith('http') ? (
                            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-3xl">{meal.image}</span>
                          )}
                        </div>

                        {/* Meal Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-lg truncate pr-2 font-heading">{meal.name}</h3>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              {meal.time}
                            </span>
                          </div>
                          
                          {meal.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                              {meal.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-2">
                            <span className="font-bold text-primary">
                              {meal.calories} kcal
                            </span>
                            <span className="text-muted-foreground">
                              {meal.protein}g P
                            </span>
                            <span className="text-muted-foreground">
                              {meal.carbs}g C
                            </span>
                            <span className="text-muted-foreground">
                              {meal.fat}g F
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}

          {mealsByDay.length > 0 && (
            <Button
              variant="outline"
              className="w-full rounded-2xl h-12 border-border/50 hover:border-primary/50 hover:bg-card/50 transition-all"
            >
              Load More Days
            </Button>
          )}
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default MealHistory;
