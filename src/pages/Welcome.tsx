import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingDown, Heart, Smile } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion, AnimatePresence } from "framer-motion";

const Welcome = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Target,
      title: "Set Your Goals",
      description: "Define your health targets and track progress towards achieving them one day at a time."
    },
    {
      icon: TrendingDown,
      title: "Track Your Journey",
      description: "Log meals, monitor vitals, and watch your transformation unfold with detailed analytics."
    },
    {
      icon: Heart,
      title: "Stay Accountable",
      description: "Daily check-ins and weekly weigh-ins keep you committed to your wellness journey."
    },
    {
      icon: Smile,
      title: "Celebrate Progress",
      description: "Every milestone matters. Track streaks, earn badges, and share your success story."
    }
  ];

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Skip Button */}
        <div className="px-6 pt-8 flex justify-end">
          <Link to="/signup">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              Skip
            </Button>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-8 shadow-glow">
                <CurrentIcon className="w-16 h-16 text-white" />
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl font-bold mb-4 font-heading">
                {slides[currentSlide].title}
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mb-12 leading-relaxed">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex gap-2 mb-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'w-8 bg-primary shadow-glow' 
                    : 'w-2 bg-border/50 hover:bg-border'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="w-full max-w-md space-y-3">
            {currentSlide === slides.length - 1 ? (
              <Link to="/signup" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow text-lg">
                  Get Started
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={() => setCurrentSlide(currentSlide + 1)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow text-lg"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Welcome;
