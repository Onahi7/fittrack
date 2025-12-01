import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { subscriptionApi } from "@/lib/subscription-api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

const SubscriptionCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [tier, setTier] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const provider = searchParams.get('provider') || 'paystack';

      if (!reference || !currentUser) {
        setStatus('failed');
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        let result;

        if (provider === 'paystack') {
          result = await subscriptionApi.verifyPaystack(token, reference);
        } else {
          result = await subscriptionApi.verifyOpay(token, reference);
        }

        if (result.success) {
          setStatus('success');
          setTier(result.tier);
          
          // Reload subscription context
          window.location.reload();

          toast({
            title: "Payment Successful! 🎉",
            description: `Your ${result.tier} subscription is now active.`,
          });

          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setStatus('failed');
          toast({
            title: "Payment Failed",
            description: result.message || "Something went wrong with your payment.",
            variant: "destructive",
          });
        }
      } catch (error) {
        // Verification failed
        setStatus('failed');
        toast({
          title: "Verification Error",
          description: "Unable to verify your payment. Please contact support.",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, currentUser, navigate, toast]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <div className="max-w-md w-full">
          {status === 'verifying' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-sm border border-border/50 text-center"
            >
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h2 className="text-2xl font-bold mb-2 font-heading">Verifying Payment...</h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your payment
              </p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-3xl p-12 shadow-sm border-2 border-green-500 text-center"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2 font-heading">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your {tier} subscription is now active. Redirecting...
              </p>
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-sm border border-destructive text-center"
            >
              <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-bold mb-2 font-heading">Payment Failed</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't process your payment. Please try again.
              </p>
              <Button
                onClick={() => navigate('/premium')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
              >
                Back to Premium
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default SubscriptionCallback;
