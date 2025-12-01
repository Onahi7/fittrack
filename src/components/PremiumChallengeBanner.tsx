import { useState, useEffect } from 'react';
import { X, Crown, Calendar, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

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
  imageUrl?: string;
  isPremiumChallenge: boolean;
}

interface PremiumChallengeBannerProps {
  challenge: Challenge;
  onDismiss: () => void;
  onJoin: () => void;
}

const PremiumChallengeBanner = ({ challenge, onDismiss, onJoin }: PremiumChallengeBannerProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleJoin = async () => {
    try {
      setIsJoining(true);
      const response = await api.challenges.join(challenge.id);
      
      if (response.data?.message?.includes('premium')) {
        toast({
          title: "🎉 Premium Access Granted!",
          description: "You've joined the challenge and received premium access!",
        });
      } else {
        toast({
          title: "Challenge Joined!",
          description: "You've successfully joined the challenge.",
        });
      }
      
      onJoin();
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDismiss = async () => {
    try {
      setIsDismissing(true);
      await api.challenges.dismissBanner(challenge.id);
      onDismiss();
    } catch (error) {
      console.error('Error dismissing banner:', error);
      // Still dismiss locally even if API call fails
      onDismiss();
    } finally {
      setIsDismissing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'water': return '💧';
      case 'meals': return '🍽️';
      case 'streak': return '🔥';
      default: return '🎯';
    }
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-gradient-to-br from-yellow-500/95 to-orange-500/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-yellow-500/30 animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-white" />
            <span className="text-white font-bold text-lg">Premium Challenge!</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={handleDismiss}
            disabled={isDismissing}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Challenge Image */}
        {challenge.imageUrl && (
          <div className="w-full h-32 rounded-2xl overflow-hidden mb-4">
            <img 
              src={challenge.imageUrl} 
              alt={challenge.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Challenge Info */}
        <div className="text-white mb-4">
          <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
            {getTypeEmoji(challenge.type)} {challenge.name}
          </h3>
          <p className="text-white/90 text-sm mb-3 line-clamp-2">
            {challenge.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/20 rounded-xl p-2">
              <Target className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs font-semibold">{challenge.goal}</p>
              <p className="text-xs opacity-75">Daily Goal</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2">
              <Calendar className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs font-semibold">{challenge.duration}d</p>
              <p className="text-xs opacity-75">Duration</p>
            </div>
            <div className="bg-white/20 rounded-xl p-2">
              <Users className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs font-semibold">{challenge.participantCount}</p>
              <p className="text-xs opacity-75">Joined</p>
            </div>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="bg-white/20 rounded-2xl p-3 mb-4 text-center">
          <Crown className="w-5 h-5 mx-auto mb-1 text-yellow-200" />
          <p className="text-white font-semibold text-sm">Get Premium Access</p>
          <p className="text-white/80 text-xs">Join this challenge to unlock all premium features!</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleJoin}
            disabled={isJoining}
            className="flex-1 bg-white text-orange-600 hover:bg-white/90 font-bold"
          >
            {isJoining ? "Joining..." : "Join & Get Premium"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            disabled={isDismissing}
            className="px-3 border-white/30 text-white hover:bg-white/10"
          >
            Later
          </Button>
        </div>

        {/* Timeline */}
        <div className="mt-3 text-center text-white/70 text-xs">
          {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
        </div>
      </div>
    </div>
  );
};

export default PremiumChallengeBanner;