import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Heart, Scale, Droplet } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

const WeeklyCheckIn = () => {
  const { unit } = useWeightUnit();
  const [weight, setWeight] = useState("150");
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [bloodSugar, setBloodSugar] = useState("90");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2 font-heading">Weekly Check-in</h1>
            <p className="text-muted-foreground">
              Time for your weekly check-in! Let's see your progress.
            </p>
          </motion.div>
        </div>

        <div className="px-6 space-y-6">
          {/* Week Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-border/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold">Week of October 28, 2024</span>
            </div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted-foreground">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          {/* Weight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Weight</h2>
            </div>
            
            <div className="flex items-end gap-2">
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 bg-background/50 border-border/50 rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-all"
              />
              <div className="h-16 px-4 flex items-center justify-center bg-background/50 rounded-2xl border border-border/50">
                <span className="text-muted-foreground font-medium">{unit}</span>
              </div>
            </div>
          </motion.div>

          {/* Blood Pressure */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <Heart className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Blood Pressure</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Systolic</label>
                <Input
                  type="number"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="bg-background/50 border-border/50 rounded-2xl h-14 text-xl font-semibold text-center focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Diastolic</label>
                <Input
                  type="number"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="bg-background/50 border-border/50 rounded-2xl h-14 text-xl font-semibold text-center focus:border-primary transition-all"
                />
              </div>
            </div>
          </motion.div>

          {/* Blood Sugar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
                <Droplet className="w-6 h-6 text-info" />
              </div>
              <h2 className="text-xl font-semibold">Blood Sugar</h2>
            </div>
            
            <div className="flex items-end gap-2">
              <Input
                type="number"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="flex-1 bg-background/50 border-border/50 rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-all"
              />
              <div className="h-16 px-4 flex items-center justify-center bg-background/50 rounded-2xl border border-border/50">
                <span className="text-muted-foreground font-medium">mg/dL</span>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-16 shadow-glow text-lg"
            >
              Record Progress
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default WeeklyCheckIn;
