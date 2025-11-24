import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Flame, Target, Award, Star, Zap, Heart, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Achievements = () => {
  const achievements = [
    { 
      icon: Flame, 
      title: "14-Day Streak", 
      description: "Check in for 14 consecutive days",
      unlocked: true,
      date: "Unlocked Nov 20, 2024"
    },
    { 
      icon: Target, 
      title: "First Milestone", 
      description: "Lose your first 5 pounds",
      unlocked: true,
      date: "Unlocked Nov 15, 2024"
    },
    { 
      icon: Award, 
      title: "Consistency King", 
      description: "Log meals 7 days in a row",
      unlocked: true,
      date: "Unlocked Nov 12, 2024"
    },
    { 
      icon: Star, 
      title: "Photo Logger", 
      description: "Upload 50 meal photos",
      unlocked: true,
      date: "Unlocked Nov 18, 2024"
    },
    { 
      icon: Zap, 
      title: "Quick Start", 
      description: "Complete your first week",
      unlocked: true,
      date: "Unlocked Nov 8, 2024"
    },
    { 
      icon: Heart, 
      title: "Health Champion", 
      description: "Complete 10 weekly check-ins",
      unlocked: false,
      progress: "7/10"
    },
    { 
      icon: Trophy, 
      title: "Goal Crusher", 
      description: "Reach your target weight",
      unlocked: false,
      progress: "15/20 lbs"
    },
    { 
      icon: CheckCircle, 
      title: "100 Day Journey", 
      description: "Check in for 100 days",
      unlocked: false,
      progress: "42/100 days"
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/profile">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="px-6 space-y-6">
        {/* Progress Summary */}
        <div className="bg-gradient-primary rounded-3xl p-6 shadow-glow">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 border-4 border-primary-foreground/30 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground mb-1">
                Level {Math.floor(unlockedCount / 2)}
              </h2>
              <p className="text-primary-foreground/80">Keep going! You're doing great!</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-primary-foreground/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-primary-foreground h-full transition-all duration-500"
              style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-3">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className={`bg-card rounded-3xl p-5 shadow-card border transition-smooth ${
                  achievement.unlocked 
                    ? 'border-primary' 
                    : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    achievement.unlocked 
                      ? 'bg-primary/10' 
                      : 'bg-secondary'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      achievement.unlocked 
                        ? 'text-primary' 
                        : 'text-muted-foreground'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">
                      {achievement.description}
                    </p>
                    {achievement.unlocked ? (
                      <p className="text-xs text-primary font-medium">
                        {achievement.date}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Progress: {achievement.progress}
                      </p>
                    )}
                  </div>

                  {achievement.unlocked && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
