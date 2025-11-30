import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Users, Calendar, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChallenges, useUserChallenges } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { createChallenge } from "@/lib/community";
import { useToast } from "@/hooks/use-toast";

const Challenges = () => {
  const { challenges: allChallenges, loading: allLoading, refetch: refetchAll } = useChallenges();
  const { challenges: userChallenges, loading: userLoading, refetch: refetchUser } = useUserChallenges();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "custom",
    goal: "",
    duration: "",
    startDate: new Date().toISOString().split('T')[0],
  });
  
  const activeChallenges = userChallenges;
  const upcomingChallenges = allChallenges.filter((c) => 
    !userChallenges.some((uc) => uc.id === c.id)
  );

  const handleCreateChallenge = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a challenge",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.description || !formData.goal || !formData.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createChallenge(currentUser.uid, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        goal: parseInt(formData.goal),
        duration: parseInt(formData.duration),
        startDate: formData.startDate,
      });

      toast({
        title: "Success!",
        description: "Challenge created successfully",
      });

      setCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "custom",
        goal: "",
        duration: "",
        startDate: new Date().toISOString().split('T')[0],
      });

      // Refresh challenges
      refetchAll();
      refetchUser();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
          <div className="flex items-center gap-4 mb-4">
            <Link to="/community">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-heading">Challenges</h1>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl">Create Challenge</DialogTitle>
                  <DialogDescription>
                    Create a new challenge and invite others to join you!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Challenge Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., 30-Day Water Challenge"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      placeholder="Describe your challenge..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Challenge Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="water">💧 Water Intake</SelectItem>
                        <SelectItem value="meals">🍱 Meal Tracking</SelectItem>
                        <SelectItem value="streak">🔥 Daily Streak</SelectItem>
                        <SelectItem value="custom">🎯 Custom Goal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal">Goal *</Label>
                      <Input
                        id="goal"
                        type="number"
                        placeholder="e.g., 8"
                        value={formData.goal}
                        onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {formData.type === 'water' ? 'Glasses per day' : 
                         formData.type === 'meals' ? 'Meals per day' : 
                         formData.type === 'streak' ? 'Days to maintain' : 'Target number'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (days) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="e.g., 30"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    className="flex-1 rounded-2xl"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateChallenge}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Challenge"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="active" className="px-6">
          <TabsList className="w-full mb-6 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl">
            <TabsTrigger value="active" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Active</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
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
                  <div key={challenge.id} className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                        {challenge.imageUrl || icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 font-heading">{challenge.name}</h3>
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
                      <Button variant="outline" className="flex-1 rounded-2xl hover:bg-primary/5 hover:border-primary/50">
                        Leaderboard
                      </Button>
                      <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                        {challenge.type === 'custom' ? 'Update Progress' : 'View Details'}
                      </Button>
                    </div>
                    
                    {/* Auto-sync indicator for fitness challenges */}
                    {challenge.type !== 'custom' && (
                      <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Auto-syncing from your {challenge.type} logs
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-heading">No active challenges</h3>
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
                  <div key={challenge.id} className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-3xl">
                        {challenge.imageUrl || icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 font-heading">{challenge.name}</h3>
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
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-heading">No upcoming challenges</h3>
                <p className="text-muted-foreground mb-6">Check back soon for new challenges!</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 shadow-glow text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-16 -mb-16" />
              
              <Trophy className="w-16 h-16 text-white mx-auto mb-4 relative z-10" />
              <h3 className="text-white font-bold text-lg mb-2 relative z-10 font-heading">Create Your Own Challenge</h3>
              <p className="text-white/80 text-sm mb-4 relative z-10">
                Start a challenge and invite friends to join you!
              </p>
              <Button 
                variant="secondary" 
                className="rounded-2xl relative z-10"
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Challenge
              </Button>
            </div>
          </TabsContent>

          {/* Completed Challenges */}
          <TabsContent value="completed" className="space-y-4">
            <div className="text-center py-12">
              <Trophy className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-lg mb-2 font-heading">No Completed Challenges Yet</h3>
              <p className="text-muted-foreground text-sm">
                Complete your first challenge to see it here!
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Challenges;
