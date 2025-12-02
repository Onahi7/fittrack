import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Square, Clock, Flame, History, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FASTING_PLANS = [
  { id: '16-8', name: '16:8 Intermittent', fasting: 16, eating: 8, description: 'Popular & sustainable' },
  { id: '18-6', name: '18:6 Advanced', fasting: 18, eating: 6, description: 'Enhanced fat burning' },
  { id: '20-4', name: '20:4 Warrior', fasting: 20, eating: 4, description: 'For experienced fasters' },
  { id: 'omad', name: 'OMAD (23:1)', fasting: 23, eating: 1, description: 'One meal a day' },
  { id: 'circadian', name: 'Circadian (13:11)', fasting: 13, eating: 11, description: 'Aligned with body clock' },
];

const FastingTimer = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(FASTING_PLANS[0]);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Load state from local storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('fastingState');
    if (savedState) {
      const { isFasting: savedIsFasting, startTime: savedStartTime, planId } = JSON.parse(savedState);
      if (savedIsFasting && savedStartTime) {
        setIsFasting(true);
        setStartTime(new Date(savedStartTime));
        const plan = FASTING_PLANS.find(p => p.id === planId) || FASTING_PLANS[0];
        setSelectedPlan(plan);
      }
    }
    // Set empty history - will need real API integration
    setHistory([]);
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFasting && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!isFasting) return 0;
    const targetSeconds = selectedPlan.fasting * 3600;
    const progress = (elapsedTime / targetSeconds) * 100;
    return Math.min(progress, 100);
  };

  const getFastingStage = () => {
    const hours = elapsedTime / 3600;
    if (hours < 4) return { name: 'Blood Sugar Rise', icon: '🩸', color: 'text-blue-500' };
    if (hours < 8) return { name: 'Blood Sugar Fall', icon: '📉', color: 'text-green-500' };
    if (hours < 12) return { name: 'Normal State', icon: '✨', color: 'text-yellow-500' };
    if (hours < 18) return { name: 'Ketosis', icon: '🔥', color: 'text-orange-500' };
    return { name: 'Autophagy', icon: '🧬', color: 'text-purple-500' };
  };

  const toggleFasting = () => {
    if (isFasting) {
      // End fast
      setIsFasting(false);
      setStartTime(null);
      setElapsedTime(0);
      localStorage.removeItem('fastingState');
      
      toast({
        title: "Fast Completed! 🎉",
        description: `You fasted for ${formatTime(elapsedTime)}`,
      });
      
      // Add to history - will need proper backend integration
      // setHistory(prev => [{
      //   date: 'Just now',
      //   duration: formatTime(elapsedTime),
      //   plan: selectedPlan.name,
      //   status: 'completed'
      // }, ...prev]);
    } else {
      // Start fast
      const now = new Date();
      setIsFasting(true);
      setStartTime(now);
      localStorage.setItem('fastingState', JSON.stringify({
        isFasting: true,
        startTime: now.toISOString(),
        planId: selectedPlan.id
      }));
      
      toast({
        title: "Fast Started! ⏱️",
        description: `Target: ${selectedPlan.fasting} hours`,
      });
    }
  };

  const stage = getFastingStage();
  const targetTime = startTime ? new Date(startTime.getTime() + selectedPlan.fasting * 3600 * 1000) : null;

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
          <div>
            <h1 className="text-3xl font-bold font-heading">Fasting Timer</h1>
            <p className="text-muted-foreground">Track your intermittent fasting journey</p>
          </div>
          
          {/* Info Banner */}
          <div className="mt-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-3xl p-6 border border-primary/20">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              How It Works
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Choose a plan:</strong> Select from popular fasting schedules (16:8, 18:6, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Start fasting:</strong> Timer tracks your fasting window automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>Monitor progress:</strong> Watch your body transition through metabolic stages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span><strong>End when ready:</strong> Complete your fast or extend it based on how you feel</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Main Timer Card */}
          <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] p-8 shadow-card border border-border/50 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-border/50">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                style={{ width: `${getProgress()}%` }}
              />
            </div>

            <div className="mb-6">
              <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
                    <Clock className="w-4 h-4 mr-2" />
                    {selectedPlan.name}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl bg-card/95 backdrop-blur-sm border-border/50">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Select Fasting Plan</DialogTitle>
                    <DialogDescription>Choose a plan that fits your lifestyle</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {FASTING_PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => {
                          setSelectedPlan(plan);
                          setShowPlanDialog(false);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                          selectedPlan.id === plan.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border/50 hover:border-primary/50 bg-card/50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold font-heading">{plan.name}</h3>
                          {selectedPlan.id === plan.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <div className="flex gap-4 mt-2 text-xs font-medium">
                          <span className="text-orange-500">🔥 {plan.fasting}h Fasting</span>
                          <span className="text-green-500">🥗 {plan.eating}h Eating</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
              {/* Circular Progress Background */}
              <div className="absolute inset-0 rounded-full border-[8px] border-muted/20" />
              
              {/* Circular Progress Indicator (Simplified for CSS) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="text-primary transition-all duration-1000"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                <span className="text-5xl font-bold font-heading tabular-nums tracking-tight">
                  {isFasting ? formatTime(elapsedTime) : selectedPlan.fasting + ":00:00"}
                </span>
                <span className="text-muted-foreground mt-2 font-medium">
                  {isFasting ? 'Elapsed Time' : 'Target Duration'}
                </span>
                {isFasting && (
                  <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 ${stage.color}`}>
                    <span>{stage.icon}</span>
                    <span className="text-sm font-semibold">{stage.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              {isFasting && targetTime && (
                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-2">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider opacity-70">Started</p>
                    <p className="font-semibold text-foreground">
                      {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border/50" />
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wider opacity-70">Target</p>
                    <p className="font-semibold text-foreground">
                      {targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={toggleFasting}
                size="lg"
                className={`w-full max-w-xs h-14 text-lg rounded-2xl shadow-glow transition-all duration-300 ${
                  isFasting 
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                {isFasting ? (
                  <>
                    <Square className="w-5 h-5 mr-2 fill-current" />
                    End Fast
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Fasting
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 backdrop-blur-sm p-5 rounded-3xl border border-border/50">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold font-heading">7</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm p-5 rounded-3xl border border-border/50">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold font-heading">124h</p>
              <p className="text-sm text-muted-foreground">Total Fasted</p>
            </div>
          </div>

          {/* Fasting Stages Explanation */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h3 className="font-bold text-lg font-heading mb-4 flex items-center gap-2">
              <span className="text-2xl">🔬</span>
              Fasting Stages
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🩸</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">0-4 hours: Blood Sugar Rise</p>
                  <p className="text-xs text-muted-foreground">Your body is still processing your last meal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📉</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">4-8 hours: Blood Sugar Fall</p>
                  <p className="text-xs text-muted-foreground">Insulin levels drop, body starts burning stored glucose</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">8-12 hours: Normal State</p>
                  <p className="text-xs text-muted-foreground">Glycogen stores depleting, preparing for fat burning</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔥</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">12-18 hours: Ketosis</p>
                  <p className="text-xs text-muted-foreground">Fat burning increases, ketone production begins</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🧬</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">18+ hours: Autophagy</p>
                  <p className="text-xs text-muted-foreground">Cell repair and regeneration, maximum fat burning</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg font-heading">Recent History</h3>
              <Button variant="link" className="text-primary h-auto p-0">View All</Button>
            </div>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div 
                  key={index}
                  className="bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-semibold font-heading">{item.duration} Fast</p>
                      <p className="text-xs text-muted-foreground">{item.date} • {item.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

// Helper component for history icon
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default FastingTimer;
