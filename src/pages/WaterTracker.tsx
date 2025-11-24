import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Droplets } from "lucide-react";
import { Link } from "react-router-dom";
import { useWaterTracker } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Water Tracker</h1>
        <p className="text-muted-foreground">Stay hydrated throughout the day</p>
      </div>

      <div className="px-6 space-y-8">
        {/* Water Visualization */}
        <div className="relative">
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border overflow-hidden">
            {/* Water fill effect */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-info/20 transition-all duration-500"
              style={{ height: `${percentage}%` }}
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-info/10 border-4 border-info/20 flex items-center justify-center mb-6">
                <Droplets className="w-16 h-16 text-info" />
              </div>
              
              <h2 className="text-6xl font-bold mb-2">{glasses}</h2>
              <p className="text-xl text-muted-foreground mb-1">of {goal} glasses</p>
              <p className="text-sm text-muted-foreground">
                {Math.round(percentage)}% of daily goal
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button
            onClick={removeGlass}
            variant="outline"
            size="lg"
            className="flex-1 rounded-2xl h-16 border-border hover:border-destructive hover:text-destructive transition-smooth"
          >
            <Minus className="w-6 h-6" />
          </Button>
          
          <Button
            onClick={addGlass}
            size="lg"
            className="flex-1 bg-info hover:bg-info/90 text-white font-semibold rounded-2xl h-16 shadow-glow"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add Glass
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <h3 className="font-semibold mb-4">Quick Add</h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                onClick={() => quickAdd(num)}
                variant="outline"
                className="rounded-2xl h-14 border-border hover:border-info hover:text-info transition-smooth"
              >
                +{num} glass{num > 1 ? 'es' : ''}
              </Button>
            ))}
          </div>
        </div>

        {/* Daily History */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <h3 className="font-semibold mb-4">This Week</h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
              const dayGlasses = index < 5 ? 8 : index === 5 ? 7 : 6;
              const dayPercentage = (dayGlasses / goal) * 100;
              
              return (
                <div key={day} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-10">{day}</span>
                  <div className="flex-1 bg-secondary rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-info h-full transition-all"
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
        <div className="bg-gradient-primary rounded-3xl p-6 shadow-glow">
          <h3 className="text-primary-foreground font-semibold text-lg mb-2">
            💡 Hydration Tip
          </h3>
          <p className="text-primary-foreground/80 text-sm">
            Drink a glass of water first thing in the morning to kickstart your metabolism and rehydrate after sleep.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaterTracker;
