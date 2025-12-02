import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Flame, Target, Award, Star, Zap, Heart, CheckCircle, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

const iconMap: any = {
  Trophy,
  Flame,
  Target,
  Award,
  Star,
  Zap,
  Heart,
  CheckCircle,
  Users,
};

const Achievements = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [currentUser]);

  const fetchAchievements = async () => {
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/achievements/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

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
          <h1 className="text-3xl font-bold mb-2 font-heading">Achievements</h1>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-muted-foreground">
              {unlockedCount} of {achievements.length} unlocked
            </p>
          )}
        </div>

        <div className="px-6 space-y-6">
          {/* Progress Summary */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center backdrop-blur-sm">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 font-heading">
                  Level {Math.floor(unlockedCount / 2)}
                </h2>
                <p className="text-white/80">Keep going! You're doing great!</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-black/20 rounded-full h-3 overflow-hidden relative z-10">
              <div 
                className="bg-white h-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                style={{ width: `${achievements.length > 0 ? (unlockedCount / achievements.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading achievements...
              </div>
            ) : achievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No achievements yet. Start your journey!</p>
              </div>
            ) : (
              achievements.map((achievement) => {
                const Icon = iconMap[achievement.icon] || Trophy;
                const progressPercent = (achievement.progress / achievement.requirement) * 100;
                
                return (
                  <div
                    key={achievement.id}
                    className={`bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-card border transition-all duration-300 ${
                      achievement.unlocked 
                        ? 'border-primary/50 shadow-glow' 
                        : 'border-border/50 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                        achievement.unlocked 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-secondary/50 text-muted-foreground'
                      }`}>
                        <Icon className="w-8 h-8" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 font-heading">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {achievement.unlocked ? (
                          <p className="text-xs text-primary font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
                          </p>
                        ) : (
                          <>
                            <p className="text-xs text-muted-foreground mb-1">
                              {achievement.progress} / {achievement.requirement}
                            </p>
                            <div className="bg-secondary/50 rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </>
                        )}
                      </div>

                      {achievement.unlocked && (
                        <div className="bg-primary/10 p-2 rounded-full">
                          <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Achievements;
