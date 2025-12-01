import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Lock, Globe, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroups, useUserGroups } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { joinGroup, createGroup } from "@/lib/community";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const Groups = () => {
  const { groups: allGroups, loading: allLoading, refetch: refetchAll } = useGroups();
  const { groups: myGroups, loading: myLoading, refetch: refetchMy } = useUserGroups();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [joiningGroup, setJoiningGroup] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Weight Loss",
    isPrivate: false,
  });
  
  const discoverGroups = allGroups.filter((g) => 
    !myGroups.some((mg) => mg.id === g.id)
  );

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to join a group",
        variant: "destructive",
      });
      return;
    }

    setJoiningGroup(groupId);
    try {
      await joinGroup(groupId, currentUser.uid);
      
      toast({
        title: "Success!",
        description: "You've joined the group!",
      });

      // Refresh group lists
      refetchAll();
      refetchMy();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoiningGroup(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a group",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createGroup(currentUser.uid, formData);

      toast({
        title: "Success!",
        description: "Group created successfully",
      });

      setCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        category: "Weight Loss",
        isPrivate: false,
      });

      // Refresh groups
      refetchAll();
      refetchMy();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
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
              <h1 className="text-2xl font-bold font-heading">Groups</h1>
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
                  <DialogTitle className="font-heading text-2xl">Create Group</DialogTitle>
                  <DialogDescription>
                    Create a new group and invite others to join you!
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Weekend Warriors"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description *</Label>
                    <Textarea
                      id="groupDescription"
                      placeholder="Describe your group..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="weight-loss" value="Weight Loss">🎯 Weight Loss</SelectItem>
                        <SelectItem key="fitness" value="Fitness">💪 Fitness</SelectItem>
                        <SelectItem key="nutrition" value="Nutrition">🥗 Nutrition</SelectItem>
                        <SelectItem key="wellness" value="Wellness">🧘 Wellness</SelectItem>
                        <SelectItem key="accountability" value="Accountability">📝 Accountability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private"
                      checked={formData.isPrivate}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                    />
                    <Label htmlFor="private">Private Group</Label>
                  </div>
                  {formData.isPrivate && (
                    <p className="text-xs text-muted-foreground">
                      Private groups require approval to join
                    </p>
                  )}
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
                    onClick={handleCreateGroup}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="discover" className="px-6">
          <TabsList className="w-full mb-6 bg-card/50 backdrop-blur-sm border border-border/50 p-1 rounded-2xl">
            <TabsTrigger value="discover" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Discover</TabsTrigger>
            <TabsTrigger value="my-groups" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Groups</TabsTrigger>
          </TabsList>

          {/* Discover Groups */}
          <TabsContent value="discover" className="space-y-4">
            {allLoading ? (
              <LoadingSkeleton />
            ) : discoverGroups.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {discoverGroups.map((group) => (
                <div key={group.id} className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl flex-shrink-0">
                      {group.imageUrl || '👥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg font-heading">{group.name}</h3>
                        {group.isPrivate ? (
                          <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {group.memberCount.toLocaleString()} members
                        </span>
                        <span className="text-xs text-primary font-semibold">{group.category}</span>
                      </div>
                      <Button 
                        onClick={() => handleJoinGroup(group.id!)}
                        disabled={joiningGroup === group.id}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow disabled:opacity-50"
                      >
                        {joiningGroup === group.id ? "Joining..." : "Join Group"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 font-heading">No groups available</h3>
                <p className="text-muted-foreground mb-6">Check back soon for new groups!</p>
              </div>
            )}
          </TabsContent>

          {/* My Groups */}
          <TabsContent value="my-groups" className="space-y-4">
            {myGroups.length > 0 ? (
              myGroups.map((group) => (
                <Link key={group.id} to={`/community/groups/${group.id}`}>
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 hover:border-primary transition-all duration-300 hover:shadow-glow">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl">
                        {group.imageUrl || '👥'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg font-heading">{group.name}</h3>
                          {group.isPrivate ? (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Globe className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {group.memberCount.toLocaleString()} members
                          </span>
                          <span className="text-xs text-primary font-semibold">{group.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="w-20 h-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-bold text-lg mb-2 font-heading">No Groups Yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Join groups to connect with like-minded people
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                  Discover Groups
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Groups;
