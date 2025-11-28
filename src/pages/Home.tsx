import { Button } from "@/components/ui/button";
import { Camera, Droplets, Smile, Utensils, LogOut, Sparkles, BookOpen, Users, Scan, Clock, Crown, ChefHat, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useMeals, useJournal, useWaterTracker } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from "@/components/animations/PageTransition";
import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useMemo, useState, useEffect } from "react";
import { getDailyQuote, getDailyTip } from "@/lib/motivationalContent";
import { geminiService } from "@/lib/gemini";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { MacroDashboard } from "@/components/MacroDashboard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getUserProfile, updateUserProfile } from "@/lib/userProfile";

const Home = () => {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
  const { currentUser, logout } = useAuth();
  const { subscription, checkFeatureAccess } = useSubscription();
  
  // Use useMemo to prevent creating a new Date object on every render
  const todayDate = useMemo(() => new Date(), []);
  
  const { meals, loading: mealsLoading } = useMeals(todayDate);
  const { entry, loading: journalLoading } = useJournal();
  const { glasses, loading: waterLoading } = useWaterTracker();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [runTutorial, setRunTutorial] = useState(false);
  const [dailyScripture, setDailyScripture] = useState<string | null>(null);
  const [scriptureLoading, setScriptureLoading] = useState(false);
  const [nutritionTip, setNutritionTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const fallbackQuote = useMemo(() => getDailyQuote(), []);
  const dailyTip = useMemo(() => getDailyTip(), []);
  
  useEffect(() => {
    // Check if user has seen the tutorial and get user country
    const checkTutorial = async () => {
      if (currentUser?.uid) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile?.tutorialCompleted) {
            setRunTutorial(false);
          }
          if (profile?.country) {
            setUserCountry(profile.country);
          }
          return;
        } catch (error) {
          console.error('Error loading tutorial status:', error);
        }
      }
      
      // Fallback to localStorage
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      if (!hasSeenTutorial) {
        // Delay tutorial start to allow page to render
        setTimeout(() => setRunTutorial(true), 500);
      }
    };
    
    checkTutorial();
  }, [currentUser]);

  // Generate daily scripture on mount
  useEffect(() => {
    const generateScripture = async () => {
      // Check if we have a cached scripture for today
      const cachedScripture = localStorage.getItem('dailyScripture');
      const cachedDate = localStorage.getItem('dailyScriptureDate');
      const today = new Date().toDateString();

      if (cachedScripture && cachedDate === today) {
        setDailyScripture(cachedScripture);
        return;
      }

      setScriptureLoading(true);
      const response = await geminiService.generateDailyScripture();

      if (response.success) {
        setDailyScripture(response.text);
        localStorage.setItem('dailyScripture', response.text);
        localStorage.setItem('dailyScriptureDate', today);
      }
      setScriptureLoading(false);
    };

    if (currentUser) {
      generateScripture();
    }
  }, [currentUser]);

  // Generate personalized nutrition tip based on country
  useEffect(() => {
    const generateTip = async () => {
      // Check if we have a cached tip for today
      const cachedTip = localStorage.getItem('dailyNutritionTip');
      const cachedDate = localStorage.getItem('dailyNutritionTipDate');
      const today = new Date().toDateString();

      if (cachedTip && cachedDate === today) {
        setNutritionTip(cachedTip);
        return;
      }

      setTipLoading(true);
      const response = await geminiService.generateNutritionTip({
        country: userCountry || undefined,
      });

      if (response.success) {
        setNutritionTip(response.text);
        localStorage.setItem('dailyNutritionTip', response.text);
        localStorage.setItem('dailyNutritionTipDate', today);
      }
      setTipLoading(false);
    };

    if (currentUser) {
      generateTip();
    }
  }, [currentUser, userCountry]);
  
  const handleTutorialComplete = async () => {
    setRunTutorial(false);
    
    // Save to localStorage for immediate access
    localStorage.setItem('hasSeenTutorial', 'true');
    
    // Save to backend for cross-device persistence
    if (currentUser?.uid) {
      try {
        await updateUserProfile(currentUser.uid, {
          tutorialCompleted: true,
        });
      } catch (error) {
        console.error('Error saving tutorial completion:', error);
      }
    }
  };
  
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
      <OnboardingTutorial run={runTutorial} onComplete={handleTutorialComplete} />
      <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

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
        
        {/* Daily Scripture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-primary rounded-3xl p-6 shadow-glow mb-4 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-primary-foreground mt-1 animate-pulse" />
            <div className="flex-1">
              <p className="text-primary-foreground/90 text-sm font-medium mb-1">Daily Scripture</p>
              {scriptureLoading ? (
                <div className="space-y-2">
                  <div className="h-5 bg-white/20 rounded animate-pulse"></div>
                  <div className="h-5 bg-white/20 rounded animate-pulse w-4/5"></div>
                </div>
              ) : (
                <>
                  <p className="text-primary-foreground text-lg leading-relaxed animate-in fade-in duration-700">
                    {dailyScripture || '\"Do you not know that your body is a temple of the Holy Spirit who is within you, whom you have [received as a gift] from God, and that you are not your own [property]?\" - 1 Corinthians 6:19 (AMP)'}
                  </p>
                  <p className="text-primary-foreground/70 text-xs mt-3 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Amplified Bible (AMP)
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* AI-Generated Nutrition Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl p-6 shadow-card border border-border mb-4"
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">🍎</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Evidence-Based Nutrition Tip</h3>
              </div>
              {tipLoading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground leading-relaxed">
                    {nutritionTip || dailyTip.content}
                  </p>
                  {nutritionTip && userCountry && (
                    <p className="text-xs text-primary/70 mt-2 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Personalized for {userCountry} with AI
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
        
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border" data-tour="daily-checkin">
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
      <div className="px-6 mb-8" data-tour="meals">
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

      {/* Macro Dashboard */}
      <div className="px-6 mb-8">
        <MacroDashboard meals={meals} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="px-6 flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-heading">Quick Actions</h2>
        </div>
        
        <div className="flex overflow-x-auto px-6 gap-4 pb-4 snap-x snap-mandatory no-scrollbar">
          <Link to={checkFeatureAccess('barcode_scanner') ? "/barcode-scanner" : "/premium"} className="relative min-w-[140px] snap-start">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-border/50 text-center hover:border-primary transition-all duration-300 h-full flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">Scan Food</p>
              <p className="text-muted-foreground text-[10px] mt-1">Barcode scanner</p>
              {!checkFeatureAccess('barcode_scanner') && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>

          <Link to={checkFeatureAccess('meal_planner') ? "/meal-planner" : "/premium"} className="relative min-w-[140px] snap-start">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-border/50 text-center hover:border-primary transition-all duration-300 h-full flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">Meal Planner</p>
              <p className="text-muted-foreground text-[10px] mt-1">AI suggestions</p>
              {!checkFeatureAccess('meal_planner') && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>

          <Link to={checkFeatureAccess('fasting_timer') ? "/fasting-timer" : "/premium"} className="relative min-w-[140px] snap-start">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-border/50 text-center hover:border-primary transition-all duration-300 h-full flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">Fasting</p>
              <p className="text-muted-foreground text-[10px] mt-1">Track fasts</p>
              {!checkFeatureAccess('fasting_timer') && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
            </div>
          </Link>

          <Link to="/buddies" className="min-w-[140px] snap-start">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-border/50 text-center hover:border-primary transition-all duration-300 h-full flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">Find Buddies</p>
              <p className="text-muted-foreground text-[10px] mt-1">Connect</p>
            </div>
          </Link>

          <Link to="/community" className="min-w-[140px] snap-start">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-border/50 text-center hover:border-primary transition-all duration-300 h-full flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-sm">Community</p>
              <p className="text-muted-foreground text-[10px] mt-1">Join challenges</p>
            </div>
          </Link>

          <Link to="/premium" className="min-w-[140px] snap-start">
            <div className="bg-gradient-primary rounded-3xl p-5 shadow-glow text-center hover:scale-105 transition-transform duration-300 h-full flex flex-col items-center justify-center group">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform duration-300">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold text-sm">Go Premium</p>
              <p className="text-white/80 text-[10px] mt-1">Unlock all</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="px-6">
        <h2 className="text-2xl font-bold font-heading mb-4">Your Daily Summary</h2>
        
        {/* Meals Logged */}
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 mb-4 flex items-center gap-4 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 mb-4 flex items-center gap-4 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group" data-tour="water">
            <div className="w-14 h-14 rounded-2xl bg-info/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
        <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 flex items-center gap-4 hover:shadow-glow hover:border-primary/50 transition-all duration-300 group">
          <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
