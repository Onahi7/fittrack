import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, User, Mail, Ruler, Weight, Target, Trash2, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { getUserProfile, updateUserProfile } from "@/lib/userProfile";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";

const EditProfile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { unit, formatWeight, convertWeight } = useWeightUnit();
  const { toast } = useToast();
  
  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [startingWeight, setStartingWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState("");
  const [dailyWaterGoal, setDailyWaterGoal] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setDisplayName(profile.displayName || "");
          setEmail(profile.email || "");
          setBio(profile.bio || "");
          
          // Convert weights from stored lbs to current unit
          if (profile.currentWeight) {
            setCurrentWeight(String(convertWeight(profile.currentWeight, 'lbs', unit)));
          }
          if (profile.startingWeight) {
            setStartingWeight(String(convertWeight(profile.startingWeight, 'lbs', unit)));
          }
          if (profile.goalWeight) {
            setTargetWeight(String(convertWeight(profile.goalWeight, 'lbs', unit)));
          }
          
          // Height in inches
          if (profile.height) {
            const totalInches = profile.height;
            setHeightFeet(String(Math.floor(totalInches / 12)));
            setHeightInches(String(totalInches % 12));
          }
          
          setDailyCalorieGoal(profile.dailyCalorieGoal ? String(profile.dailyCalorieGoal) : "");
          setDailyWaterGoal(profile.dailyWaterGoal ? String(profile.dailyWaterGoal) : "8");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "Failed to load your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, navigate, toast, convertWeight, unit]);

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      // Convert weights from current unit to lbs for storage
      const weightInLbs = (weight: string) => {
        if (!weight) return undefined;
        const value = parseFloat(weight);
        return convertWeight(value, unit, 'lbs');
      };

      await updateUserProfile(currentUser.uid, {
        displayName,
        bio,
        currentWeight: weightInLbs(currentWeight),
        startingWeight: weightInLbs(startingWeight),
        goalWeight: weightInLbs(targetWeight),
        height: heightFeet ? (parseFloat(heightFeet) * 12) + parseFloat(heightInches || '0') : undefined,
        dailyCalorieGoal: dailyCalorieGoal ? parseFloat(dailyCalorieGoal) : undefined,
        dailyWaterGoal: dailyWaterGoal ? parseFloat(dailyWaterGoal) : 8,
      });

      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully.",
      });
      
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    setDeleting(true);
    try {
      await api.users.deleteAccount();
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      // Log out and redirect to welcome page
      await logout();
      navigate("/welcome", { replace: true });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete your account. Please try again or contact support.",
        variant: "destructive",
      });
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-heading mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your personal information</p>
        </div>

        <div className="px-6 space-y-6">
          {/* Profile Photo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50"
          >
            <div className="flex items-center gap-4">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-20 h-20 rounded-full border-4 border-primary/20" 
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Profile Photo</h3>
                <p className="text-sm text-muted-foreground">Managed through your account provider</p>
              </div>
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 space-y-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-heading">Basic Information</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="rounded-2xl border-border/50 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="rounded-2xl border-border/50 bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="rounded-2xl border-border/50 bg-background/50 min-h-[100px]"
              />
            </div>
          </motion.div>

          {/* Body Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 space-y-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Weight className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold font-heading">Body Metrics</h2>
                <p className="text-sm text-muted-foreground">All weights in {unit}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingWeight">Starting Weight</Label>
                <div className="relative">
                  <Input
                    id="startingWeight"
                    type="number"
                    step="0.1"
                    value={startingWeight}
                    onChange={(e) => setStartingWeight(e.target.value)}
                    placeholder="0"
                    className="rounded-2xl border-border/50 bg-background/50 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentWeight">Current Weight</Label>
                <div className="relative">
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="0"
                    className="rounded-2xl border-border/50 bg-background/50 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {unit}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeight">Goal Weight</Label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="0"
                  className="rounded-2xl border-border/50 bg-background/50 pl-11 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {unit}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    placeholder="0"
                    className="rounded-2xl border-border/50 bg-background/50 pl-11 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ft
                  </span>
                </div>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    placeholder="0"
                    className="rounded-2xl border-border/50 bg-background/50 pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    in
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 space-y-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-heading">Daily Goals</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyCalorieGoal">Daily Calorie Goal (optional)</Label>
              <div className="relative">
                <Input
                  id="dailyCalorieGoal"
                  type="number"
                  value={dailyCalorieGoal}
                  onChange={(e) => setDailyCalorieGoal(e.target.value)}
                  placeholder="2000"
                  className="rounded-2xl border-border/50 bg-background/50 pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  cal
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyWaterGoal">Daily Water Goal</Label>
              <div className="relative">
                <Input
                  id="dailyWaterGoal"
                  type="number"
                  step="0.5"
                  value={dailyWaterGoal}
                  onChange={(e) => setDailyWaterGoal(e.target.value)}
                  placeholder="8"
                  className="rounded-2xl border-border/50 bg-background/50 pr-20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  glasses
                </span>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-2xl h-12 shadow-glow font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="bg-destructive/5 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-destructive/20"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold font-heading text-destructive">Danger Zone</h2>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full rounded-2xl h-11"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All meal logs and nutrition data</li>
                      <li>Progress photos and measurements</li>
                      <li>Journal entries and notes</li>
                      <li>Community posts and interactions</li>
                      <li>Challenges and achievements</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90 rounded-2xl"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default EditProfile;
