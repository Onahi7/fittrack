import { ReactNode } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  feature: string;
  children: ReactNode;
  tier?: 'premium' | 'pro';
  fallback?: ReactNode;
}

export const PremiumGate = ({ feature, children, tier = 'premium', fallback }: PremiumGateProps) => {
  const { checkFeatureAccess, hasPremiumAccess, hasProAccess, subscription } = useSubscription();
  const navigate = useNavigate();

  const hasAccess = tier === 'premium' 
    ? hasPremiumAccess 
    : tier === 'pro' 
    ? hasProAccess 
    : checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border-2 border-primary/20 text-center">
      <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-glow">
        {tier === 'pro' ? (
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        ) : (
          <Crown className="w-10 h-10 text-primary-foreground" />
        )}
      </div>
      
      <div className="mb-4">
        <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-bold mb-2">
          {tier === 'pro' ? 'Pro Feature' : 'Premium Feature'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Upgrade to {tier === 'pro' ? 'Pro' : 'Premium'} to unlock this feature and accelerate your wellness journey
        </p>
      </div>

      <div className="bg-card rounded-2xl p-4 mb-6 border border-border">
        <p className="text-sm text-muted-foreground mb-2">Current Plan</p>
        <p className="font-semibold text-lg capitalize">{subscription.tier}</p>
      </div>

      <Button
        onClick={() => navigate('/premium')}
        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 px-8 shadow-glow"
      >
        <Crown className="w-5 h-5 mr-2" />
        Upgrade Now
      </Button>
    </div>
  );
};

interface FeatureLockedProps {
  tier: 'premium' | 'pro';
  featureName: string;
}

export const FeatureLocked = ({ tier, featureName }: FeatureLockedProps) => {
  const navigate = useNavigate();
  const price = tier === 'premium' ? '₦15,000' : '₦45,000';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-3xl p-8 shadow-card border border-border text-center">
        <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Lock className="w-12 h-12 text-primary-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Feature Locked</h1>
        <p className="text-muted-foreground mb-2">
          <span className="font-semibold text-foreground">{featureName}</span> is a {tier} feature
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Upgrade to unlock unlimited access and premium features
        </p>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 mb-6 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-2">
            {tier === 'pro' ? 'Pro Plan' : 'Premium Plan'}
          </p>
          <p className="text-3xl font-bold text-primary mb-1">{price}</p>
          <p className="text-xs text-muted-foreground">/month</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/premium')}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 shadow-glow"
          >
            <Crown className="w-5 h-5 mr-2" />
            View Plans & Upgrade
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full rounded-2xl h-12"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};
