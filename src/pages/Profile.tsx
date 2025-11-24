import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Trophy, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from "@/components/animations/PageTransition";
import { motion } from "framer-motion";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { profile, loading } = useUserProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const stats = [
    { label: "Current Streak", value: `${profile?.currentStreak || 0} days`, icon: Zap, to: "/achievements" },
    { label: "Total Entries", value: `${profile?.totalEntries || 0}`, icon: Trophy, to: "/achievements" },
  ];

  const menuItems = [
    { icon: User, label: "Edit Profile", to: "/profile/edit" },
    { icon: Bell, label: "Notifications", to: "/profile/notifications" },
    { icon: Shield, label: "Privacy & Security", to: "/profile/privacy" },
    { icon: HelpCircle, label: "Help & Support", to: "/profile/help" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="px-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-primary rounded-3xl p-6 shadow-glow">
          <div className="flex items-center gap-4 mb-4">
            {loading ? (
              <Skeleton className="w-20 h-20 rounded-full" />
            ) : currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" className="w-20 h-20 rounded-full border-4 border-primary-foreground/30" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 border-4 border-primary-foreground/30 flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
            )}
            <div className="flex-1">
              {loading ? (
                <>
                  <Skeleton className="h-7 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-primary-foreground mb-1">
                    {currentUser?.displayName || 'User'}
                  </h2>
                  <p className="text-primary-foreground/80">{currentUser?.email}</p>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {loading ? (
              <>
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
              </>
            ) : (
              stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Link key={index} to={stat.to}>
                    <div className="bg-primary-foreground/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-primary-foreground/20 transition-smooth">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-primary-foreground" />
                        <span className="text-xs text-primary-foreground/80">{stat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-primary-foreground">{stat.value}</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Settings Menu */}
        <div className="bg-card rounded-3xl overflow-hidden shadow-card border border-border">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} to={item.to}>
                <div className={`flex items-center gap-4 p-5 hover:bg-secondary/50 transition-smooth ${
                  index !== menuItems.length - 1 ? 'border-b border-border' : ''
                }`}>
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <h3 className="font-semibold text-lg mb-4">Your Progress Summary</h3>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-8 w-full mt-4" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Starting Weight</span>
                <span className="font-semibold">{profile?.startingWeight ? `${profile.startingWeight} lbs` : 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Weight</span>
                <span className="font-semibold">{profile?.currentWeight ? `${profile.currentWeight} lbs` : 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Goal Weight</span>
                <span className="font-semibold">{profile?.goalWeight ? `${profile.goalWeight} lbs` : 'Not set'}</span>
              </div>
              {profile?.startingWeight && profile?.currentWeight && (
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Lost</span>
                    <span className="font-bold text-primary text-xl">
                      {profile.startingWeight - profile.currentWeight} lbs
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full rounded-2xl h-14 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-smooth"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Profile;
