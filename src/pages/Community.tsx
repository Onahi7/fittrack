import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Trophy, TrendingUp, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from "@/components/animations/PageTransition";
import { motion } from "framer-motion";
import { useUserChallenges, useFriends } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const Community = () => {
  const { challenges, loading: challengesLoading } = useUserChallenges();
  const { friends, loading: friendsLoading } = useFriends();
  
  const isLoading = challengesLoading || friendsLoading;

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
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">Connect, compete, and grow together</p>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-3xl p-4 shadow-card border border-border text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{friends.length}</p>
            <p className="text-xs text-muted-foreground">Friends</p>
          </div>
          <div className="bg-card rounded-3xl p-4 shadow-card border border-border text-center">
            <Trophy className="w-6 h-6 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">{challenges.length}</p>
            <p className="text-xs text-muted-foreground">Challenges</p>
          </div>
          <div className="bg-card rounded-3xl p-4 shadow-card border border-border text-center">
            <TrendingUp className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Rank</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <Link to="/buddies">
            <div className="bg-gradient-primary rounded-3xl p-6 shadow-glow text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold">Find Buddies</p>
            </div>
          </Link>

          <Link to="/community/feed">
            <div className="bg-card rounded-3xl p-6 shadow-card border border-border text-center hover:border-primary transition-smooth">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="font-semibold">Social Feed</p>
            </div>
          </Link>

          <Link to="/community/challenges">
            <div className="bg-card rounded-3xl p-6 shadow-card border border-border text-center hover:border-primary transition-smooth">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-semibold">Challenges</p>
            </div>
          </Link>

          <Link to="/community/groups">
            <div className="bg-card rounded-3xl p-6 shadow-card border border-border text-center hover:border-primary transition-smooth">
              <Users className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="font-semibold">Groups</p>
            </div>
          </Link>

          <Link to="/community/friends">
            <div className="bg-card rounded-3xl p-6 shadow-card border border-border text-center hover:border-primary transition-smooth">
              <svg className="w-12 h-12 text-primary mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="font-semibold">Find Friends</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="px-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Active Challenges</h2>
          <Link to="/community/challenges">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </div>

        {challenges.length > 0 ? (
          <div className="space-y-4">
            {challenges.slice(0, 3).map((challenge) => {
              const daysLeft = challenge.endDate ? Math.ceil((new Date(challenge.endDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
              const progress = challenge.duration > 0 ? ((challenge.duration - daysLeft) / challenge.duration * 100) : 0;
              
              return (
                <div key={challenge.id} className="bg-card rounded-3xl p-6 shadow-card border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                      {challenge.imageUrl || (challenge.type === 'water' ? '💧' : challenge.type === 'meals' ? '🍱' : '🔥')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{challenge.name || 'Challenge'}</h3>
                      <p className="text-sm text-muted-foreground">{daysLeft} days left</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No active challenges yet</p>
            <Link to="/community/challenges">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                Browse Challenges
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="px-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-card rounded-3xl p-8 shadow-card border border-border text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-2">No recent activity</p>
          <p className="text-sm text-muted-foreground">Activity from your friends will appear here</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Community;
