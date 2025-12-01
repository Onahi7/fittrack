import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, MessageCircle, Share2, Camera, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useFeed } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { createPost, likePost } from "@/lib/community";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';

const Feed = () => {
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { posts, loading, refetch } = useFeed();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      return;
    }

    if (!newPost.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    try {
      await createPost({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'User',
        userAvatar: currentUser.photoURL || undefined,
        content: newPost.trim(),
        type: 'general',
      });

      setNewPost("");
      toast({
        title: "Success!",
        description: "Your post has been created",
      });

      // Refresh the feed
      await refetch();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    
    try {
      await likePost(postId, currentUser.uid);
      await refetch();
    } catch (error) {
      console.error('Error liking post:', error);
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
      <div className="px-6 pt-8 pb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
        <div className="flex items-center gap-4">
          <Link to="/community">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Community Feed</h1>
        </div>
      </div>

      {/* Create Post */}
      <div className="px-6 py-6 border-b border-border">
        <div className="bg-card rounded-3xl p-6 shadow-card border border-border">
          <Textarea
            placeholder="Share your progress, meal, or thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="min-h-[100px] border-0 focus-visible:ring-0 resize-none mb-4"
          />
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Camera className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleCreatePost}
              disabled={isPosting || !newPost.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPosting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="px-6 py-6 space-y-6">
        {loading ? (
          <LoadingSkeleton />
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-card rounded-3xl shadow-card border border-border overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {post.userAvatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{post.userName}</h3>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-4">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="Post" className="rounded-2xl w-full mb-4" />
                )}
              </div>
              <div className="px-6 pb-6 flex items-center gap-6">
                <button 
                  onClick={() => handleLikePost(post.id!)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-smooth"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-semibold">{post.likesCount || post.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{post.commentCount}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth ml-auto">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card rounded-3xl p-12 shadow-card border border-border text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to share something with the community!</p>
          </div>
        )}
      </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Feed;

