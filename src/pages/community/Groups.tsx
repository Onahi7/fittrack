import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Lock, Globe, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGroups, useUserGroups } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

const Groups = () => {
  const { groups: allGroups, loading: allLoading } = useGroups();
  const { groups: myGroups, loading: myLoading } = useUserGroups();
  
  const discoverGroups = allGroups.filter((g) => 
    !myGroups.some((mg) => mg.id === g.id)
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
              <h1 className="text-2xl font-bold font-heading">Groups</h1>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
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
                      <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                        Join Group
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
