import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-sm border border-border/50">
            <h1 className="text-9xl font-bold text-primary/20 mb-4 font-heading">404</h1>
            <h2 className="text-2xl font-bold mb-4 font-heading">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
                <Link to="/" className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Return Home
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full h-12 rounded-2xl hover:bg-secondary/10">
                <Link to={-1 as any} className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
