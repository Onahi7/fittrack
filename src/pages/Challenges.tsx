import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Crown, 
  Medal,
  Clock,
  CheckCircle,
  Play,
  Star
} from "lucide-react";
import { format } from "date-fns";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from "@/components/animations/PageTransition";

interface Challenge {
  id: number;
  name: string;
  description: string;
  type: string;
  goal: number;
  duration: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  creatorId: string;
  imageUrl?: string;
  createdAt: string;
}

interface UserChallenge extends Challenge {
  participation?: {
    progress: number;
    completed: boolean;
    joinedAt: string;
  };
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  progress: number;
  completed: boolean;
  rank?: number;
}

const CHALLENGE_TYPES = {
  water: { icon: '💧', color: 'bg-blue-500', label: 'Water Intake' },
  meals: { icon: '🍽️', color: 'bg-green-500', label: 'Meal Logging' },
  streak: { icon: '🔥', color: 'bg-orange-500', label: 'Streak Challenge' },
  steps: { icon: '👟', color: 'bg-purple-500', label: 'Steps Goal' },
  workout: { icon: '💪', color: 'bg-red-500', label: 'Workout Days' },
  meditation: { icon: '🧘', color: 'bg-indigo-500', label: 'Mindfulness' },
  custom: { icon: '🎯', color: 'bg-gray-500', label: 'Custom Goal' }
};

export default function ChallengesPage() {
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      fetchChallenges();
      fetchUserChallenges();
    }
  }, [currentUser]);

  const fetchChallenges = async () => {
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges/my-challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserChallenges(data.map((item: any) => ({
          ...item.challenge,
          participation: item.participation
        })));
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (challengeId: number) => {
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges/${challengeId}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add rank to entries
        const rankedData = data
          .sort((a: any, b: any) => b.progress - a.progress)
          .map((entry: any, index: number) => ({
            ...entry,
            rank: index + 1
          }));
        setLeaderboard(rankedData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    setJoinLoading(true);
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've joined the challenge. Good luck!"
        });
        fetchUserChallenges();
        setShowDetails(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to join challenge",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge",
        variant: "destructive"
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const showChallengeDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    fetchLeaderboard(challenge.id);
    setShowDetails(true);
  };

  const getStatusBadge = (challenge: Challenge) => {
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    if (now < start) {
      return <Badge variant="secondary">Starts {format(start, 'MMM dd')}</Badge>;
    } else if (now > end) {
      return <Badge variant="outline">Ended</Badge>;
    } else {
      return <Badge className="bg-green-500">Active</Badge>;
    }
  };

  const isUserParticipating = (challengeId: number) => {
    return userChallenges.some(c => c.id === challengeId);
  };

  const getDaysRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-32">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <BottomNav />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-32">
        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <h1 className="text-3xl font-bold mb-2">Challenges</h1>
          <p className="text-muted-foreground">Join challenges and compete with the community</p>
        </div>

        <div className="px-6">
          <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              <div className="grid gap-4">
                {availableChallenges.map((challenge) => {
                  const typeInfo = CHALLENGE_TYPES[challenge.type as keyof typeof CHALLENGE_TYPES] || CHALLENGE_TYPES.custom;
                  const isParticipating = isUserParticipating(challenge.id);
                  
                  return (
                    <Card key={challenge.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => showChallengeDetails(challenge)}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 ${typeInfo.color} rounded-lg text-white text-xl`}>
                            {typeInfo.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{challenge.name}</h3>
                              {getStatusBadge(challenge)}
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Goal: {challenge.goal}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {challenge.duration} days
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {challenge.participantCount} joined
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isParticipating && (
                                  <Badge className="bg-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Joined
                                  </Badge>
                                )}
                                <Badge variant="outline">{typeInfo.label}</Badge>
                              </div>
                              <Button 
                                variant={isParticipating ? "outline" : "default"}
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isParticipating) {
                                    handleJoinChallenge(challenge.id);
                                  }
                                }}
                                disabled={joinLoading || isParticipating}
                              >
                                {isParticipating ? "Joined" : "Join Challenge"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="my-challenges" className="space-y-4">
              {userChallenges.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No active challenges</h3>
                    <p className="text-muted-foreground mb-4">Join a challenge to start tracking your progress!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userChallenges.map((challenge) => {
                    const typeInfo = CHALLENGE_TYPES[challenge.type as keyof typeof CHALLENGE_TYPES] || CHALLENGE_TYPES.custom;
                    const progress = challenge.participation ? (challenge.participation.progress / challenge.duration) * 100 : 0;
                    const daysRemaining = getDaysRemaining(challenge.endDate);
                    
                    return (
                      <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 ${typeInfo.color} rounded-lg text-white text-xl`}>
                              {typeInfo.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-lg">{challenge.name}</h3>
                                <div className="flex items-center gap-2">
                                  {challenge.participation?.completed && (
                                    <Badge className="bg-green-500">
                                      <Trophy className="w-3 h-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                  <Badge variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {daysRemaining}d left
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-muted-foreground text-sm mb-3">{challenge.description}</p>
                              
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{challenge.participation?.progress || 0} / {challenge.duration} days</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge variant="outline">{typeInfo.label}</Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => showChallengeDetails(challenge)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Challenge Details Modal */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedChallenge && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className={`p-2 ${CHALLENGE_TYPES[selectedChallenge.type as keyof typeof CHALLENGE_TYPES]?.color || 'bg-gray-500'} rounded-lg text-white`}>
                      {CHALLENGE_TYPES[selectedChallenge.type as keyof typeof CHALLENGE_TYPES]?.icon || '🎯'}
                    </div>
                    {selectedChallenge.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedChallenge.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Challenge Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{selectedChallenge.goal}</p>
                      <p className="text-sm text-muted-foreground">Daily Goal</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{selectedChallenge.duration}</p>
                      <p className="text-sm text-muted-foreground">Days</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{selectedChallenge.participantCount}</p>
                      <p className="text-sm text-muted-foreground">Participants</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{getDaysRemaining(selectedChallenge.endDate)}</p>
                      <p className="text-sm text-muted-foreground">Days Left</p>
                    </div>
                  </div>

                  {/* Leaderboard */}
                  {leaderboard.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        Leaderboard
                      </h4>
                      <div className="space-y-2">
                        {leaderboard.slice(0, 5).map((entry) => (
                          <div key={entry.userId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                {entry.rank}
                              </div>
                              <span className="font-medium">{entry.userName || 'User'}</span>
                              {entry.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                              {entry.rank === 2 && <Medal className="w-4 h-4 text-gray-400" />}
                              {entry.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{entry.progress} days</p>
                              {entry.completed && <Badge className="bg-green-500 text-xs">Completed</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                  {!isUserParticipating(selectedChallenge.id) && (
                    <Button 
                      onClick={() => handleJoinChallenge(selectedChallenge.id)}
                      disabled={joinLoading}
                    >
                      {joinLoading ? "Joining..." : "Join Challenge"}
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <BottomNav />
    </PageTransition>
  );
}