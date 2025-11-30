import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Ruler, Weight, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { createUserProfile, getUserProfile } from "@/lib/userProfile";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

const Setup = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const { unit } = useWeightUnit();
  const { toast } = useToast();
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      // Only redirect if auth is done loading and user is not logged in
      if (!authLoading && !currentUser) {
        navigate("/signup", { replace: true });
        return;
      }

      // Check if user has already completed setup
      if (!authLoading && currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          // If profile exists and has setup data (weight goals), redirect to home
          if (profile && (profile.setupCompleted || (profile.startingWeight && profile.goalWeight))) {
            navigate("/", { replace: true });
            return;
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          // Continue to show setup page if there's an error
        } finally {
          setCheckingProfile(false);
        }
      }
    };

    checkProfile();
  }, [currentUser, authLoading, navigate]);

  // Show loading spinner while checking auth or profile
  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleComplete = async () => {
    if (!currentUser) return;

    // Validate inputs
    if (!currentWeight || !targetWeight || !heightFeet) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if profile already exists
      const existingProfile = await getUserProfile(currentUser.uid);
      
      if (existingProfile) {
        // Update existing profile
        const { updateUserProfile } = await import("@/lib/userProfile");
        await updateUserProfile(currentUser.uid, {
          startingWeight: parseFloat(currentWeight),
          currentWeight: parseFloat(currentWeight),
          goalWeight: parseFloat(targetWeight),
          height: heightFeet && heightInches ? (parseFloat(heightFeet) * 12) + parseFloat(heightInches || '0') : undefined,
          setupCompleted: true,
        });
      } else {
        // Create new profile
        await createUserProfile(
          currentUser.uid,
          currentUser.email || "",
          currentUser.displayName || "User",
          currentUser.photoURL || undefined
        );
        
        // Update with setup data
        const { updateUserProfile } = await import("@/lib/userProfile");
        await updateUserProfile(currentUser.uid, {
          startingWeight: parseFloat(currentWeight),
          currentWeight: parseFloat(currentWeight),
          goalWeight: parseFloat(targetWeight),
          height: heightFeet && heightInches ? (parseFloat(heightFeet) * 12) + parseFloat(heightInches || '0') : undefined,
          setupCompleted: true,
        });
      }

      toast({
        title: "Setup complete!",
        description: "Your profile has been created successfully.",
      });
      
      // Wait a moment for the backend to process, then verify profile before navigating
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the profile was updated successfully
      const updatedProfile = await getUserProfile(currentUser.uid);
      if (updatedProfile && (updatedProfile.setupCompleted || (updatedProfile.startingWeight && updatedProfile.goalWeight))) {
        navigate("/", { replace: true });
      } else {
        // Fallback navigation if verification fails
        setTimeout(() => navigate("/", { replace: true }), 1000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Setup failed",
        description: error instanceof Error ? error.message : "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Link to="/welcome">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2 font-heading">Let's Get Started</h1>
            <p className="text-muted-foreground">
              Tell us about yourself to personalize your experience
            </p>
          </motion.div>
        </div>

        <div className="px-6 space-y-6">
          {/* Current Weight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Weight className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold block">Current Weight</Label>
            </div>
            <div className="flex items-end gap-2">
              <Input
                type="number"
                placeholder="170"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="flex-1 bg-background/50 border-border/50 rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-all"
              />
              <div className="h-16 px-4 flex items-center justify-center bg-background/50 rounded-2xl border border-border/50">
                <span className="text-muted-foreground font-medium">{unit}</span>
              </div>
            </div>
          </motion.div>

          {/* Target Weight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold block">Target Weight</Label>
            </div>
            <div className="flex items-end gap-2">
              <Input
                type="number"
                placeholder="150"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="flex-1 bg-background/50 border-border/50 rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-all"
              />
              <div className="h-16 px-4 flex items-center justify-center bg-background/50 rounded-2xl border border-border/50">
                <span className="text-muted-foreground font-medium">{unit}</span>
              </div>
            </div>
          </motion.div>

          {/* Height */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <div className="flex items-center gap-2 mb-3">
              <Ruler className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold block">Height</Label>
            </div>
            <div className="flex items-end gap-2">
              <Input
                type="number"
                placeholder="5"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                className="flex-1 bg-background/50 border-border/50 rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-all"
              />
              <span className="text-2xl font-semibold text-muted-foreground mb-4">ft</span>
              <Input
                type="number"
                placeholder="10"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                className="flex-1 bg-background/50 border-border/50 rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-all"
              />
              <div className="h-16 px-4 flex items-center justify-center bg-background/50 rounded-2xl border border-border/50">
                <span className="text-muted-foreground font-medium">in</span>
              </div>
            </div>
          </motion.div>

          {/* Goal Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-primary to-accent rounded-3xl p-6 shadow-glow relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <h3 className="text-white font-semibold text-lg mb-2 relative z-10">
              Your Journey Starts Now
            </h3>
            <p className="text-white/90 text-sm relative z-10">
              We'll help you track your progress, stay accountable with daily check-ins, and celebrate every milestone along the way.
            </p>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              onClick={handleComplete}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-16 shadow-glow text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Setup;
