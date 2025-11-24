import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Users, Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChallenges, useUserChallenges } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const Challenges = () => {
  const { challenges: allChallenges, loading: allLoading } = useChallenges();
  const { challenges: userChallenges, loading: userLoading } = useUserChallenges();
  
  const activeChallenges = userChallenges;
  const upcomingChallenges = allChallenges.filter((c) => 
    !userChallenges.some((uc) => uc.id === c.id)
  );

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/community">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Challenges</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="px-6">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
        </TabsList>

        {/* Active Challenges */}
        <TabsContent value="active" className="space-y-4">
          {userLoading ? (
            <LoadingSkeleton />
          ) : activeChallenges.length > 0 ? (
            activeChallenges.map((challenge) => {
              const icon = challenge.type === 'water' ? '💧' : challenge.type === 'meals' ? '🍱' : challenge.type === 'streak' ? '🔥' : '🎯';
              const daysLeft = challenge.endDate ? Math.ceil((new Date(challenge.endDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <div key={challenge.id} className="bg-card rounded-3xl p-6 shadow-card border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                      {challenge.imageUrl || icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{challenge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {challenge.participantCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {daysLeft} days left
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-semibold text-primary">{challenge.duration} days</span>
                    </div>
                    <Progress value={(challenge.duration - daysLeft) / challenge.duration * 100} className="h-2" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 rounded-2xl">
                      Leaderboard
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl">
                      Update Progress
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-card rounded-3xl p-12 shadow-card border border-border text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active challenges</h3>
              <p className="text-muted-foreground mb-6">Join a challenge to start tracking your progress!</p>
            </div>
          )}
        </TabsContent>

        {/* Upcoming Challenges */}
        <TabsContent value="upcoming" className="space-y-4">
          {allLoading ? (
            <LoadingSkeleton />
          ) : upcomingChallenges.length > 0 ? (
            upcomingChallenges.map((challenge) => {
              const icon = challenge.type === 'water' ? '💧' : challenge.type === 'meals' ? '🍱' : challenge.type === 'streak' ? '🔥' : '🎯';
              const startsIn = challenge.startDate ? Math.ceil((new Date(challenge.startDate as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <div key={challenge.id} className="bg-card rounded-3xl p-6 shadow-card border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
                      {challenge.imageUrl || icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{challenge.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {challenge.participantCount} joined
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {startsIn > 0 ? `Starts in ${startsIn} days` : 'Starting soon'}
                        </span>
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                        Join Challenge
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-card rounded-3xl p-12 shadow-card border border-border text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No upcoming challenges</h3>
              <p className="text-muted-foreground mb-6">Check back soon for new challenges!</p>
            </div>
          )}

          <div className="bg-gradient-primary rounded-3xl p-8 shadow-glow text-center">
            <Trophy className="w-16 h-16 text-white mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Create Your Own Challenge</h3>
            <p className="text-white/80 text-sm mb-4">
              Start a challenge and invite friends to join you!
            </p>
            <Button variant="secondary" className="rounded-2xl">
              Create Challenge
            </Button>
          </div>
        </TabsContent>

        {/* Completed Challenges */}
        <TabsContent value="completed" className="space-y-4">
          <div className="text-center py-12">
            <Trophy className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">No Completed Challenges Yet</h3>
            <p className="text-muted-foreground text-sm">
              Complete your first challenge to see it here!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Challenges;
