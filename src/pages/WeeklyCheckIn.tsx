import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Calendar, Heart, Scale, Droplet } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const WeeklyCheckIn = () => {
  const [weight, setWeight] = useState("150");
  const [systolic, setSystolic] = useState("120");
  const [diastolic, setDiastolic] = useState("80");
  const [bloodSugar, setBloodSugar] = useState("90");

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Weekly Check-in</h1>
        <p className="text-muted-foreground">
          Time for your weekly check-in! Let's see your progress.
        </p>
      </div>

      <div className="px-6 space-y-6">
        {/* Week Selector */}
        <div className="bg-card rounded-3xl p-5 shadow-card border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold">Week of October 28, 2024</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-muted-foreground">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Weight */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
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
              className="flex-1 bg-secondary border-border rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-smooth"
            />
            <div className="h-16 px-4 flex items-center justify-center bg-secondary rounded-2xl border border-border">
              <span className="text-muted-foreground font-medium">lbs</span>
            </div>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
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
                className="bg-secondary border-border rounded-2xl h-14 text-xl font-semibold text-center focus:border-primary transition-smooth"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Diastolic</label>
              <Input
                type="number"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="bg-secondary border-border rounded-2xl h-14 text-xl font-semibold text-center focus:border-primary transition-smooth"
              />
            </div>
          </div>
        </div>

        {/* Blood Sugar */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
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
              className="flex-1 bg-secondary border-border rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-smooth"
            />
            <div className="h-16 px-4 flex items-center justify-center bg-secondary rounded-2xl border border-border">
              <span className="text-muted-foreground font-medium">mg/dL</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-16 shadow-glow text-lg"
        >
          Record Progress
        </Button>
      </div>
    </div>
  );
};

export default WeeklyCheckIn;
