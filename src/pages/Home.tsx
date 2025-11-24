import { Button } from "@/components/ui/button";
import { Camera, Droplets, Smile, Utensils, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useMeals, useJournal, useWaterTracker } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from "@/components/animations/PageTransition";
import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useMemo } from "react";

const Home = () => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const { currentUser, logout } = useAuth();
  
  // Use useMemo to prevent creating a new Date object on every render
  const todayDate = useMemo(() => new Date(), []);
  
  const { meals, loading: mealsLoading } = useMeals(todayDate);
  const { entry, loading: journalLoading } = useJournal();
  const { glasses, loading: waterLoading } = useWaterTracker();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isLoading = mealsLoading || journalLoading || waterLoading;

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate('/welcome');
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const mealsLogged = meals.length;
  const totalMeals = 4;
  const mealProgress = (mealsLogged / totalMeals) * 100;
  
  const waterGoal = 8;
  const waterProgress = (glasses / waterGoal) * 100;

  if (isLoading) {
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
        <div className="flex justify-between items-start mb-2">
          <p className="text-muted-foreground text-sm">{today}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {currentUser?.displayName?.split(' ')[0] || 'there'}!
        </h1>
        
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <h2 className="text-xl font-semibold mb-2">Ready for your daily check-in?</h2>
          <p className="text-muted-foreground mb-4">Start your day on the right track.</p>
          <Link to="/journal">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-12 shadow-glow">
              Let's Go
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Meals */}
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Today's Meals</h2>
        <div className="grid grid-cols-2 gap-4">
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => (
            <Link key={meal} to="/log-meal">
              <div className="bg-card rounded-3xl p-6 shadow-card border border-border hover:border-primary transition-smooth aspect-square flex flex-col items-center justify-center gap-4">
                <Camera className="w-12 h-12 text-primary" />
                <span className="font-semibold">{meal}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily Summary */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-4">Your Daily Summary</h2>
        
        {/* Meals Logged */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border mb-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Meals Logged</span>
              <span className="text-sm text-muted-foreground">{mealsLogged} of {totalMeals}</span>
            </div>
            <Progress value={mealProgress} className="h-2" />
          </div>
        </div>

        {/* Water Intake */}
        <Link to="/water-tracker">
          <div className="bg-card rounded-3xl p-6 shadow-card border border-border mb-4 flex items-center gap-4 hover:border-primary transition-smooth">
            <div className="w-14 h-14 rounded-full bg-info/10 flex items-center justify-center">
              <Droplets className="w-7 h-7 text-info" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Water Intake</span>
                <span className="text-sm text-muted-foreground">{glasses} of {waterGoal} glasses</span>
              </div>
              <Progress value={waterProgress} className="h-2" />
            </div>
          </div>
        </Link>

        {/* Mood */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
            <Smile className="w-7 h-7 text-success" />
          </div>
          <div className="flex-1">
            <span className="font-semibold block mb-1">Mood</span>
            <span className="text-muted-foreground">
              {entry?.mood || "Not logged yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Home;
