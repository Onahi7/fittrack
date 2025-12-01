import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { useWaterTracker } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import { motion } from "framer-motion";

const WaterTracker = () => {
  const { glasses, incrementGlasses, decrementGlasses, updateGlasses } = useWaterTracker();
  const { toast } = useToast();
  const goal = 8;
  const percentage = Math.min((glasses / goal) * 100, 100);

  const addGlass = async () => {
    if (glasses < 20) {
      await incrementGlasses();
      if (glasses + 1 >= goal) {
        toast({
          title: "Daily goal reached! 🎉",
          description: "Great job staying hydrated!",
        });
      }
    }
  };

  const removeGlass = () => {
    if (glasses > 0) decrementGlasses();
  };

  const quickAdd = async (num: number) => {
    const newValue = Math.min(glasses + num, 20);
    await updateGlasses(newValue);
    if (newValue >= goal && glasses < goal) {
      toast({
        title: "Daily goal reached! 🎉",
        description: "Great job staying hydrated!",
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading">Water Tracker</h1>
              <p className="text-muted-foreground text-sm">Stay hydrated throughout the day</p>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-8">
          {/* Water Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-border/50 overflow-hidden relative">
              {/* Water fill effect */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-1000 ease-out"
                style={{ height: `${percentage}%` }}
              />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-40 h-40 rounded-full bg-blue-500/10 border-4 border-blue-500/20 flex items-center justify-center mb-6 relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all duration-1000 ease-out opacity-20"
                    style={{ height: `${percentage}%` }}
                  />
                  <Droplets className={`w-16 h-16 transition-colors duration-500 ${percentage >= 100 ? 'text-blue-600' : 'text-blue-500'}`} />
                </div>
                
                <h2 className="text-6xl font-bold mb-2 font-heading text-foreground">{glasses}</h2>
                <p className="text-xl text-muted-foreground mb-1">of {goal} glasses</p>
                <p className="text-sm text-blue-500 font-medium bg-blue-500/10 px-3 py-1 rounded-full">
                  {Math.round(percentage)}% of daily goal
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button
              onClick={removeGlass}
              variant="outline"
              size="lg"
              className="flex-1 rounded-2xl h-16 border-border/50 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all bg-card/50 backdrop-blur-sm"
            >
              <Minus className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={addGlass}
              size="lg"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl h-16 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Glass
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h3 className="font-semibold mb-4 font-heading">Quick Add</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((num) => (
                <Button
                  key={num}
                  onClick={() => quickAdd(num)}
                  variant="outline"
                  className="rounded-2xl h-14 border-border/50 hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-500/5 transition-all bg-background/50"
                >
                  +{num} glass{num > 1 ? 'es' : ''}
                </Button>
              ))}
            </div>
          </div>

          {/* Daily History */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h3 className="font-semibold mb-4 font-heading">This Week</h3>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const dayGlasses = 0; // No mock data - will need real API integration
                const dayPercentage = (dayGlasses / goal) * 100;
                
                return (
                  <div key={day} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-10">{day}</span>
                    <div className="flex-1 bg-secondary/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all rounded-full"
                        style={{ width: `${dayPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{dayGlasses}/{goal}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-6 shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h3 className="text-white font-semibold text-lg mb-2 flex items-center gap-2 font-heading">
              <Droplets className="w-5 h-5" />
              Hydration Tip
            </h3>
            <p className="text-white/90 text-sm leading-relaxed relative z-10">
              Drink a glass of water first thing in the morning to kickstart your metabolism and rehydrate after sleep.
            </p>
          </div>
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default WaterTracker;
