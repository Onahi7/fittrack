import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from "@/components/animations/PageTransition";
import { motion } from "framer-motion";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMeals } from "@/hooks/useFirestore";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const Progress = () => {
  const { profile, loading: profileLoading } = useUserProfile();
  const { meals, loading: mealsLoading } = useMeals(new Date());
  const timeframes = ['1M', '3M', '6M', '1Y'];
  
  if (profileLoading || mealsLoading) {
    return (
      <PageTransition>
        <LoadingSkeleton />
        <BottomNav />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Your Progress</h1>
      </div>

      {/* Timeframe Selector */}
      <div className="px-6 mb-6">
        <div className="flex gap-2">
          {timeframes.map((tf, index) => (
            <Button
              key={tf}
              variant={index === 1 ? "default" : "outline"}
              className={`flex-1 rounded-2xl h-10 ${
                index === 1 
                  ? 'bg-primary text-primary-foreground shadow-glow' 
                  : 'bg-secondary border-border hover:border-primary'
              }`}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Achievement Card */}
        {profile && profile.currentStreak > 0 && (
          <div className="bg-gradient-primary rounded-3xl p-6 shadow-glow">
            <p className="text-primary-foreground/80 text-sm mb-2">🏆</p>
            <p className="text-primary-foreground text-lg leading-relaxed">
              {profile.startingWeight && profile.currentWeight ? (
                <>
                  Awesome job! You've lost <span className="font-bold">{profile.startingWeight - profile.currentWeight} lbs</span> and you're on a <span className="font-bold">{profile.currentStreak}-day check-in streak</span>. Keep it up!
                </>
              ) : (
                <>
                  Great progress! You're on a <span className="font-bold">{profile.currentStreak}-day streak</span>. Keep it up!
                </>
              )}
            </p>
          </div>
        )}

        {/* Weight Journey */}
        {profile && (profile.startingWeight || profile.goalWeight) ? (
          <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
            <h2 className="text-xl font-semibold mb-2">Weight Journey</h2>
            <div className="flex justify-between text-sm text-muted-foreground mb-4">
              {profile.startingWeight && <span>Starting: {profile.startingWeight} lbs</span>}
              {profile.goalWeight && <span>Goal: {profile.goalWeight} lbs</span>}
            </div>
            
            {/* Placeholder for chart */}
            <div className="bg-secondary/50 rounded-2xl aspect-video flex items-center justify-center border border-border">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Weight progress tracking</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-3xl p-6 shadow-card border border-border text-center">
            <h2 className="text-xl font-semibold mb-4">Weight Journey</h2>
            <p className="text-muted-foreground mb-4">Set your weight goals to track your progress</p>
            <Link to="/profile">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                Update Profile
              </Button>
            </Link>
          </div>
        )}

        {/* Health Stats */}
        {profile && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
                <p className="text-sm text-muted-foreground mb-2">Total Entries</p>
                <p className="text-2xl font-bold">{profile.totalEntries}</p>
              </div>
              <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
                <p className="text-sm text-muted-foreground mb-2">Total Meals</p>
                <p className="text-2xl font-bold">{profile.totalMeals}</p>
              </div>
              <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
                <p className="text-sm text-muted-foreground mb-2">Water Glasses</p>
                <p className="text-2xl font-bold">{profile.totalWaterGlasses}</p>
              </div>
              <div className="bg-card rounded-3xl p-5 shadow-card border border-border">
                <p className="text-sm text-muted-foreground mb-2">Longest Streak</p>
                <p className="text-2xl font-bold">{profile.longestStreak} days</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Meals */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Meals</h2>
            <Link to="/meal-history">
              <Button variant="ghost" className="text-primary">View All</Button>
            </Link>
          </div>
          
          {meals.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {meals.slice(0, 3).map((meal) => (
                <div
                  key={meal.id}
                  className="aspect-square rounded-3xl bg-secondary/50 border border-border overflow-hidden"
                >
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt="Meal" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center">
              <p className="text-muted-foreground mb-4">No meals logged yet</p>
              <Link to="/log-meal">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                  Log Your First Meal
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Progress;
