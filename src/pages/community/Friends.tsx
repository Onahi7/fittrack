import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, UserPlus, UserCheck, UserX, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriends, useFriendRequests } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendFriendRequest, acceptFriendRequest, getSuggestedFriends, rejectFriendRequest, removeFriend } from "@/lib/community";
import { useAuth } from "@/contexts/AuthContext";
// Use community helpers instead of generic api client
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SuggestedFriend {
  id?: string;
  userId: string;
  displayName?: string;
  photoURL?: string;
  goals?: string[];
  matchScore?: number;
}

const Friends = () => {
  const { currentUser } = useAuth();
  const { friends, loading } = useFriends();
  const { requests, loading: requestsLoading } = useFriendRequests();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedFriends, setSuggestedFriends] = useState<SuggestedFriend[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [friendToRemove, setFriendToRemove] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();
  
  // Fetch suggested friends
  useEffect(() => {
    const fetchSuggested = async () => {
      if (!currentUser) return;
      try {
        setLoadingSuggested(true);
        const data = await getSuggestedFriends();
        setSuggestedFriends(data || []);
      } catch (error) {
        console.error('Error fetching suggested friends:', error);
        setSuggestedFriends([]);
      } finally {
        setLoadingSuggested(false);
      }
    };
    fetchSuggested();
  }, [currentUser]);

  // Filter pending requests
  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleAddFriend = async (userId: string, name: string) => {
    if (!currentUser) return;
    try {
      await sendFriendRequest(currentUser.uid, userId);
      toast({
        title: "Friend request sent!",
        description: `Your request to ${name} has been sent.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string, name: string) => {
    if (!currentUser) return;
    try {
      await acceptFriendRequest(requestId, fromUserId, currentUser.uid);
      toast({
        title: "Friend request accepted!",
        description: `You are now friends with ${name}.`,
      });
      // Refresh requests
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string, name: string) => {
    if (!currentUser) return;
    try {
      await rejectFriendRequest(requestId);
      toast({
        title: "Request declined",
        description: `Friend request from ${name} has been declined.`,
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async () => {
    if (!currentUser || !friendToRemove) return;
    try {
      await removeFriend(friendToRemove.id);
      toast({
        title: "Friend removed",
        description: `${friendToRemove.name} has been removed from your friends list.`,
        variant: "destructive",
      });
      setFriendToRemove(null);
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive",
      });
      setFriendToRemove(null);
    }
  };

  const filteredFriends = friends.filter((buddy) =>
    (buddy.buddy?.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-2xl font-bold font-heading">Friends</h1>
              <p className="text-sm text-muted-foreground">
                {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="px-6">
          <TabsList className="w-full mb-6 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl">
            <TabsTrigger value="all" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Friends</TabsTrigger>
            <TabsTrigger value="requests" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="find" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Find Friends</TabsTrigger>
          </TabsList>

          {/* All Friends */}
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((buddy) => (
                <div key={buddy.id} className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl overflow-hidden">
                      {buddy.buddy?.photoURL ? (
                        <img src={buddy.buddy.photoURL} alt={buddy.buddy.displayName || 'Friend'} className="w-full h-full object-cover" />
                      ) : '👤'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg font-heading">{buddy.buddy?.displayName || 'Friend'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {buddy.sharedGoals?.length || 0} shared goals
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full hover:bg-primary/5 hover:border-primary/50"
                        onClick={() => toast({ title: "Messaging coming soon!" })}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/5"
                        onClick={() => setFriendToRemove({id: buddy.id!, name: buddy.buddy?.displayName || 'Friend'})}
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-heading">
                  {searchQuery ? "No friends found" : "No friends yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Start connecting with people to see them here!"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Pending Requests */}
          <TabsContent value="requests" className="space-y-4">
            {requestsLoading ? (
              <LoadingSkeleton />
            ) : pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <div key={request.id} className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl overflow-hidden">
                      {request.fromUser?.photoURL ? (
                        <img src={request.fromUser.photoURL} alt={request.fromUser.displayName || 'User'} className="w-full h-full object-cover" />
                      ) : '👤'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 font-heading">{request.fromUser?.displayName || 'User'}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Wants to connect with you
                      </p>
                      {request.fromUser?.goals && request.fromUser.goals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {request.fromUser.goals.slice(0, 3).map((goal: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                          onClick={() => handleAcceptRequest(request.id!, request.fromUserId, request.fromUser?.displayName || 'User')}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 rounded-2xl hover:bg-destructive/5 hover:text-destructive hover:border-destructive/50"
                          onClick={() => handleRejectRequest(request.id!, request.fromUser?.displayName || 'User')}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <UserCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-heading">No pending requests</h3>
                <p className="text-muted-foreground">Friend requests will appear here</p>
              </div>
            )}
          </TabsContent>

          {/* Find Friends */}
          <TabsContent value="find" className="space-y-4">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 shadow-glow mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <h3 className="text-white font-bold text-lg mb-2 relative z-10 font-heading">Connect with others</h3>
              <p className="text-white/80 text-sm relative z-10">
                Find people with similar goals and build your support network!
              </p>
            </div>

            <h3 className="font-semibold text-lg mb-4 font-heading">Suggested for you</h3>
            
            {loadingSuggested ? (
              <LoadingSkeleton />
            ) : suggestedFriends.length > 0 ? (
              suggestedFriends.map((person) => (
                <div key={person.id || person.userId} className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl overflow-hidden">
                      {person.photoURL ? (
                        <img src={person.photoURL} alt={person.displayName || 'User'} className="w-full h-full object-cover" />
                      ) : '👤'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 font-heading">{person.displayName || 'User'}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Match Score: {person.matchScore || 0}%
                      </p>
                      {person.goals && person.goals.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {person.goals.slice(0, 3).map((goal: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      )}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                        onClick={() => handleAddFriend(person.userId, person.displayName || 'User')}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-heading">No suggestions available</h3>
                <p className="text-muted-foreground">Check back later for friend suggestions!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Remove Friend Confirmation Dialog */}
        <AlertDialog open={!!friendToRemove} onOpenChange={(open) => !open && setFriendToRemove(null)}>
          <AlertDialogContent className="rounded-3xl bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading">Remove Friend?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove <span className="font-semibold text-foreground">{friendToRemove?.name}</span> from your friends list?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveFriend}
                className="rounded-2xl bg-destructive hover:bg-destructive/90"
              >
                Remove Friend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Friends;
