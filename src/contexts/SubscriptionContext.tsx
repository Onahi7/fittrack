import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

// Type definitions for payment gateways
interface PaystackResponse {
  reference: string;
  status: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
}

interface PaystackHandler {
  openIframe: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => PaystackHandler;
    };
  }
}

export type SubscriptionTier = 'free' | 'premium' | 'pro';

interface SubscriptionData {
  tier: SubscriptionTier;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  expiresAt?: string;
  startedAt?: string;
  autoRenew: boolean;
  currentPeriodEnd?: string;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  loading: boolean;
  isPremium: boolean;
  isPro: boolean;
  hasPremiumAccess: boolean;
  hasProAccess: boolean;
  checkFeatureAccess: (feature: string) => boolean;
  upgradeSubscription: (tier: SubscriptionTier, paymentMethod: 'paystack' | 'opay') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const PREMIUM_FEATURES = [
  'unlimited_meals',
  'macro_tracking',
  'barcode_scanner',
  'meal_planner',
  'recipe_library',
  'workout_plans',
  'advanced_analytics',
  'multiple_buddies',
];

const PRO_FEATURES = [
  ...PREMIUM_FEATURES,
  'ai_coach',
  'custom_meal_plans',
  'video_coaching',
  'nutrition_expert',
  'body_metrics',
  'api_access',
  'fasting_timer',
];

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: 'free',
    status: 'inactive',
    autoRenew: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!currentUser) {
      setSubscription({
        tier: 'free',
        status: 'inactive',
        autoRenew: false,
      });
      setLoading(false);
      return;
    }

    try {
      // Fetch from backend API
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/subscriptions/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription({
          tier: data.tier,
          status: data.status,
          autoRenew: data.autoRenew,
          currentPeriodEnd: data.currentPeriodEnd,
        });
      } else {
        // Default to free if no subscription found
        setSubscription({
          tier: 'free',
          status: 'inactive',
          autoRenew: false,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Fallback to free on error
      setSubscription({
        tier: 'free',
        status: 'inactive',
        autoRenew: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const isPremium = subscription.tier === 'premium' && subscription.status === 'active';
  const isPro = subscription.tier === 'pro' && subscription.status === 'active';
  const hasPremiumAccess = isPremium || isPro;
  const hasProAccess = isPro;

  const checkFeatureAccess = (feature: string): boolean => {
    if (subscription.tier === 'free') {
      return !PREMIUM_FEATURES.includes(feature) && !PRO_FEATURES.includes(feature);
    }
    if (subscription.tier === 'premium') {
      return PREMIUM_FEATURES.includes(feature);
    }
    if (subscription.tier === 'pro') {
      return PRO_FEATURES.includes(feature);
    }
    return false;
  };

  const upgradeSubscription = async (tier: SubscriptionTier, paymentMethod: 'paystack' | 'opay') => {
    if (!currentUser) throw new Error('Not authenticated');

    const amount = tier === 'premium' ? 15000 : 45000; // NGN

    // Initialize payment based on method
    if (paymentMethod === 'paystack') {
      await initializePaystackPayment(tier, amount);
    } else {
      await initializeOPayPayment(tier, amount);
    }
  };

  const initializePaystackPayment = async (tier: SubscriptionTier, amount: number) => {
    // Paystack integration
    if (!window.PaystackPop) {
      toast({
        title: "Paystack Not Loaded",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_xxx', // Add to .env
      email: currentUser?.email || '',
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      ref: `${tier}_${Date.now()}`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Subscription Tier',
            variable_name: 'tier',
            value: tier,
          },
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: currentUser?.uid || '',
          },
        ],
      },
      callback: async (response: PaystackResponse) => {
        // Verify payment on backend
        try {
          const token = await currentUser.getIdToken();
          const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              reference: response.reference,
              gateway: 'paystack',
            }),
          });

          if (!verifyResponse.ok) {
            throw new Error('Payment verification failed');
          }

          const result = await verifyResponse.json();
          
          setSubscription({
            tier: result.tier,
            status: result.status,
            autoRenew: result.autoRenew,
            currentPeriodEnd: result.currentPeriodEnd,
          });

          toast({
            title: "Subscription Activated! 🎉",
            description: `You now have ${tier} access. Enjoy your premium features!`,
          });
          
          window.location.href = '/';
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({
            title: "Payment Verification Failed",
            description: "Please contact support with your reference number.",
            variant: "destructive",
          });
        }
      },
      onClose: () => {
        toast({
          title: "Payment Cancelled",
          description: "You can upgrade anytime from the Premium page.",
        });
      },
    });
    handler.openIframe();
  };

  const initializeOPayPayment = async (tier: SubscriptionTier, amount: number) => {
    // OPay integration
    const reference = `opay_${tier}_${Date.now()}`;
    
    try {
      const token = await currentUser.getIdToken();
      
      // Call backend to initialize OPay payment
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tier,
          gateway: 'opay',
        }),
      });

      if (!response.ok) {
        throw new Error('Payment initialization failed');
      }

      const { authorizationUrl } = await response.json();
      
      // Redirect to OPay checkout
      window.location.href = authorizationUrl;
      
    } catch (error) {
      console.error('Error initializing OPay payment:', error);
      toast({
        title: "Payment Failed",
        description: "Could not initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const cancelSubscription = async () => {
    if (!currentUser) throw new Error('Not authenticated');

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Cancellation failed');
      }

      const updatedSub = { ...subscription, status: 'cancelled' as const, autoRenew: false };
      setSubscription(updatedSub);
      
      toast({
        title: "Subscription Cancelled",
        description: "You'll retain access until the end of your billing period.",
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Cancellation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshSubscription = async () => {
    setLoading(true);
    await fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isPremium,
        isPro,
        hasPremiumAccess,
        hasProAccess,
        checkFeatureAccess,
        upgradeSubscription,
        cancelSubscription,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
