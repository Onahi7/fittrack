import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, MessageCircle, Share2, Camera, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useFeed } from "@/hooks/useCommunity";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const Feed = () => {
  const [newPost, setNewPost] = useState("");
  const { posts, loading } = useFeed();

  return (
    <div className="min-h-screen bg-background pb-8">
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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
              <Send className="w-4 h-4 mr-2" />
              Post
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
                <button className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-smooth">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-semibold">{post.likes}</span>
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
    </div>
  );
};

export default Feed;

