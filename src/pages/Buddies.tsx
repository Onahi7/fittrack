import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserPlus, CheckCircle, X, MessageCircle, Trophy, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

interface BuddyRequest {
  id: string;
  name: string;
  image: string;
  streak: number;
  weightLoss: number;
  message: string;
}

interface Buddy {
  id: string;
  name: string;
  image: string;
  streak: number;
  weightLoss: number;
  status: 'active' | 'pending';
  sharedGoals: string[];
}

const Buddies = () => {
  const { currentUser } = useAuth();
  const { unit } = useWeightUnit();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [findBuddyOpen, setFindBuddyOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [suggestedBuddies, setSuggestedBuddies] = useState<any[]>([]);

  useEffect(() => {
    console.log('[Buddies] Component mounted, currentUser:', currentUser?.uid);
    if (currentUser) {
      fetchBuddies();
      fetchRequests();
      fetchSuggested();
    }
  }, [currentUser]);

  const fetchBuddies = async () => {
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddies/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBuddies(data.map((b: any) => ({
          id: b.id.toString(),
          name: b.buddy.displayName || 'User',
          image: b.buddy.photoURL || 'https://via.placeholder.com/200',
          streak: 0,
          weightLoss: 0,
          status: 'active',
          sharedGoals: b.sharedGoals || []
        })));
      }
    } catch (error) {
      console.error('Error fetching buddies:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      console.log('[Buddies] Fetching pending requests...');
      const token = await currentUser?.getIdToken();
      console.log('[Buddies] Token obtained:', token ? 'Yes' : 'No');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddies/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[Buddies] Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('[Buddies] Pending requests data:', data);
        setRequests(data.map((r: any) => ({
          id: r.id.toString(),
          name: r.user.displayName || 'User',
          image: r.user.photoURL || 'https://via.placeholder.com/200',
          streak: 0,
          weightLoss: 0,
          message: 'Wants to be accountability partners!'
        })));
      } else {
        console.error('[Buddies] Failed to fetch requests:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchSuggested = async () => {
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddies/suggested`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestedBuddies(data.map((s: any) => ({
          id: s.id,
          name: s.displayName || 'User',
          image: s.photoURL || 'https://via.placeholder.com/200',
          streak: 0,
          weightLoss: 0,
          matchScore: Math.floor(Math.random() * 20) + 80
        })));
      }
    } catch (error) {
      console.error('Error fetching suggested buddies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      const token = await currentUser?.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddies/requests/${id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const request = requests.find(r => r.id === id);
        toast({
          title: "Buddy Request Accepted!",
          description: `You and ${request?.name} are now accountability buddies`,
        });
        fetchBuddies();
        fetchRequests();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      const token = await currentUser?.getIdToken();
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddies/requests/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: "Request Declined",
        description: "The buddy request has been declined",
      });
      fetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive",
      });
    }
  };

  const handleSendRequest = async (targetUserId: string, name: string) => {
    try {
      const token = await currentUser?.getIdToken();
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/buddies/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
      });
      toast({
        title: "Request Sent!",
        description: `Your buddy request has been sent to ${name}`,
      });
      setFindBuddyOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      });
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
          <Link to="/community">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold font-heading">Accountability Buddies</h1>
              <p className="text-muted-foreground">Stay motivated together</p>
            </div>
            <Dialog open={findBuddyOpen} onOpenChange={setFindBuddyOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Find Buddy
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl max-h-[80vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
                <DialogHeader>
                  <DialogTitle className="font-heading">Find Accountability Buddy</DialogTitle>
                  <DialogDescription>
                    Connect with like-minded people on their wellness journey
                  </DialogDescription>
                </DialogHeader>

                <Input
                  type="text"
                  placeholder="Search by name or goals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-2xl h-12 bg-background/50"
                />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground font-heading">Suggested for You</h3>
                  {suggestedBuddies.map((buddy) => (
                    <div
                      key={buddy.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 bg-card/50"
                    >
                      <img
                        src={buddy.image}
                        alt={buddy.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold font-heading">{buddy.name}</h3>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {buddy.matchScore}% match
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            🔥 {buddy.streak} day streak
                          </span>
                          <span className="flex items-center gap-1">
                            📉 -{buddy.weightLoss} {unit === 'lbs' ? 'lbs' : 'kg'}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSendRequest(buddy.id, buddy.name)}
                        size="sm"
                        className="rounded-2xl shadow-glow"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="px-6">
          <Tabs defaultValue="buddies" className="w-full">
            <TabsList className="w-full mb-6 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl">
              <TabsTrigger value="buddies" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Buddies ({buddies.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative">
                Requests ({requests.length})
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {requests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Buddies Tab */}
            <TabsContent value="buddies" className="space-y-4">
              {buddies.length === 0 ? (
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 font-heading">No Buddies Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Find an accountability buddy to stay motivated!
                  </p>
                  <Button
                    onClick={() => setFindBuddyOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Find Your First Buddy
                  </Button>
                </div>
              ) : (
                buddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={buddy.image}
                        alt={buddy.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 font-heading">{buddy.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            🔥 {buddy.streak} day streak
                          </span>
                          <span className="flex items-center gap-1">
                            📉 -{buddy.weightLoss} {unit}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {buddy.sharedGoals.map((goal, index) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="rounded-2xl hover:bg-primary/5 hover:border-primary/50"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        View Progress
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-2xl hover:bg-primary/5 hover:border-primary/50"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              {requests.length === 0 ? (
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                  <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 font-heading">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    You'll see buddy requests here when someone wants to connect
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={request.image}
                        alt={request.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 font-heading">{request.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            🔥 {request.streak} day streak
                          </span>
                          <span className="flex items-center gap-1">
                            📉 -{request.weightLoss} {unit}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          "{request.message}"
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        variant="outline"
                        className="rounded-2xl border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Benefits Section */}
          <div className="mt-8 bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h3 className="text-white font-bold text-lg mb-3 relative z-10 font-heading">Why Accountability Buddies?</h3>
            <div className="space-y-2 relative z-10">
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-white mt-0.5" />
                <p className="text-white/90 text-sm">Stay motivated and celebrate wins together</p>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-white mt-0.5" />
                <p className="text-white/90 text-sm">Share goals and track progress side-by-side</p>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-white mt-0.5" />
                <p className="text-white/90 text-sm">Get support when you need it most</p>
              </div>
            </div>
          </div>
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Buddies;
