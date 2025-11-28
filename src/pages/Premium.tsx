import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Crown, Sparkles, Zap, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import BottomNav from "@/components/BottomNav";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

const Premium = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, upgradeSubscription, hasPremiumAccess, hasProAccess } = useSubscription();
  const [selectedTier, setSelectedTier] = useState<'premium' | 'pro' | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handleSelectTier = (tier: 'premium' | 'pro') => {
    setSelectedTier(tier);
    setShowPaymentOptions(true);
  };

  const handlePayment = async (method: 'paystack' | 'opay') => {
    if (!selectedTier) return;

    try {
      await upgradeSubscription(selectedTier, method);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const freeFeatures = [
    "Basic meal logging (10/week)",
    "Water tracking",
    "Daily journal",
    "Basic progress charts",
    "1 accountability buddy",
    "Community access",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "Unlimited meal logging",
    "Macro tracking & breakdown",
    "AI meal suggestions",
    "Barcode scanner",
    "Recipe library (1000+)",
    "Workout plans",
    "5 accountability buddies",
    "Advanced analytics",
    "Priority support",
  ];

  const proFeatures = [
    "Everything in Premium",
    "Personal AI health coach",
    "Custom meal plans",
    "1-on-1 video coaching (monthly)",
    "Nutrition expert access",
    "Advanced body metrics",
    "API access",
    "White-label option",
    "Early access to features",
  ];

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
          <Link to="/">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-glow">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading">Go Premium</h1>
              <p className="text-muted-foreground text-sm">Unlock your full potential</p>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Current Plan */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg font-heading">Current Plan</h3>
              <span className="px-3 py-1 bg-background/50 rounded-full text-sm font-medium capitalize border border-border/50">
                {subscription.tier}
                {subscription.status === 'active' && ' (Active)'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You're currently on the free plan. Upgrade to unlock premium features!
            </p>
            <div className="space-y-2">
              {freeFeatures.slice(0, 3).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Plan */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 border-2 border-primary shadow-glow relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-sm">
              POPULAR
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-xl font-heading">Premium</h3>
                <p className="text-sm text-muted-foreground">For serious users</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary tracking-tight">₦15,000</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Billed monthly via Paystack or OPay
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {premiumFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSelectTier('premium')}
              disabled={hasPremiumAccess || hasProAccess}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 shadow-glow disabled:opacity-50 transition-all hover:shadow-lg"
            >
              {hasPremiumAccess || hasProAccess ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <Zap className="w-5 h-5 mr-2" />
              )}
              {hasPremiumAccess || hasProAccess ? 'Current Plan' : 'Upgrade to Premium'}
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 border border-border/50 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl font-heading">Pro</h3>
                <p className="text-sm text-muted-foreground">For professionals</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight">₦45,000</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Billed monthly via Paystack or OPay
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {proFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Button
              onClick={() => handleSelectTier('pro')}
              disabled={hasProAccess}
              variant="outline"
              className="w-full border-purple-500 text-purple-500 hover:bg-purple-500/10 rounded-2xl h-12 disabled:opacity-50 transition-colors"
            >
              {hasProAccess ? (
                <><Check className="w-4 h-4 mr-2" />Current Plan</>
              ) : (
                'Upgrade to Pro'
              )}
            </Button>
          </div>

          {/* Why Upgrade Section */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h3 className="font-semibold mb-4 font-heading">Why Upgrade?</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">AI-Powered Insights</p>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations based on your goals and progress
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Faster Results</p>
                  <p className="text-sm text-muted-foreground">
                    Advanced tracking and analytics help you reach goals 2x faster
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Unlimited Potential</p>
                  <p className="text-sm text-muted-foreground">
                    No limits on meal logging, buddies, or data storage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20 text-center backdrop-blur-sm">
            <p className="font-semibold mb-1 text-green-600">30-Day Money Back Guarantee</p>
            <p className="text-sm text-muted-foreground">
              Not satisfied? Get a full refund, no questions asked.
            </p>
          </div>
        </div>

        {/* Payment Method Modal */}
        {showPaymentOptions && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-3xl p-6 shadow-2xl border border-border max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4 text-center font-heading">
                Choose Payment Method
              </h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Select your preferred payment gateway to complete your {selectedTier} subscription
              </p>

              <div className="space-y-3 mb-6">
                <Button
                  onClick={() => handlePayment('paystack')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 flex items-center justify-between shadow-glow"
                >
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold">Paystack</p>
                      <p className="text-xs opacity-80">Card, Bank Transfer, USSD</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {selectedTier === 'premium' ? '₦15,000' : '₦45,000'}
                  </span>
                </Button>

                <Button
                  onClick={() => handlePayment('opay')}
                  variant="outline"
                  className="w-full border-2 rounded-2xl h-14 flex items-center justify-between hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <p className="font-semibold">OPay</p>
                      <p className="text-xs text-muted-foreground">Fast & Secure Payment</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {selectedTier === 'premium' ? '₦15,000' : '₦45,000'}
                  </span>
                </Button>
              </div>

              <Button
                onClick={() => {
                  setShowPaymentOptions(false);
                  setSelectedTier(null);
                }}
                variant="ghost"
                className="w-full rounded-2xl h-10"
              >
                Cancel
              </Button>

              <div className="mt-6 p-4 bg-secondary/50 rounded-2xl">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Premium;
