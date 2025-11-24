import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createUserProfile, getUserProfile } from "@/lib/userProfile";
import { useToast } from "@/hooks/use-toast";

const Setup = () => {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
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
          if (profile && profile.startingWeight && profile.goalWeight) {
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
      <div className="min-h-screen flex items-center justify-center">
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
        });
      }

      toast({
        title: "Setup complete!",
        description: "Your profile has been created successfully.",
      });
      
      navigate("/");
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
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/welcome">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Let's Get Started</h1>
        <p className="text-muted-foreground">
          Tell us about yourself to personalize your experience
        </p>
      </div>

      <div className="px-6 space-y-6">
        {/* Current Weight */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <Label className="text-base font-semibold mb-3 block">Current Weight</Label>
          <div className="flex items-end gap-2">
            <Input
              type="number"
              placeholder="170"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="flex-1 bg-secondary border-border rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-smooth"
            />
            <div className="h-16 px-4 flex items-center justify-center bg-secondary rounded-2xl border border-border">
              <span className="text-muted-foreground font-medium">lbs</span>
            </div>
          </div>
        </div>

        {/* Target Weight */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <Label className="text-base font-semibold mb-3 block">Target Weight</Label>
          <div className="flex items-end gap-2">
            <Input
              type="number"
              placeholder="150"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="flex-1 bg-secondary border-border rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-smooth"
            />
            <div className="h-16 px-4 flex items-center justify-center bg-secondary rounded-2xl border border-border">
              <span className="text-muted-foreground font-medium">lbs</span>
            </div>
          </div>
        </div>

        {/* Height */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <Label className="text-base font-semibold mb-3 block">Height</Label>
          <div className="flex items-end gap-2">
            <Input
              type="number"
              placeholder="5"
              value={heightFeet}
              onChange={(e) => setHeightFeet(e.target.value)}
              className="flex-1 bg-secondary border-border rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-smooth"
            />
            <span className="text-2xl font-semibold text-muted-foreground mb-4">ft</span>
            <Input
              type="number"
              placeholder="10"
              value={heightInches}
              onChange={(e) => setHeightInches(e.target.value)}
              className="flex-1 bg-secondary border-border rounded-2xl h-16 text-2xl font-semibold text-center focus:border-primary transition-smooth"
            />
            <div className="h-16 px-4 flex items-center justify-center bg-secondary rounded-2xl border border-border">
              <span className="text-muted-foreground font-medium">in</span>
            </div>
          </div>
        </div>

        {/* Goal Info Card */}
        <div className="bg-gradient-primary rounded-3xl p-6 shadow-glow">
          <h3 className="text-primary-foreground font-semibold text-lg mb-2">
            Your Journey Starts Now
          </h3>
          <p className="text-primary-foreground/80 text-sm">
            We'll help you track your progress, stay accountable with daily check-ins, and celebrate every milestone along the way.
          </p>
        </div>

        {/* Submit Button */}
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
      </div>
    </div>
  );
};

export default Setup;
