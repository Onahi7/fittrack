import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingDown, Heart, Smile } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip Button */}
      <div className="px-6 pt-8 flex justify-end">
        <Link to="/signup">
          <Button variant="ghost" className="text-muted-foreground">
            Skip
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {/* Icon */}
        <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center mb-8 shadow-glow">
          <CurrentIcon className="w-16 h-16 text-primary-foreground" />
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-bold text-center mb-4">
          {slides[currentSlide].title}
        </h1>
        <p className="text-center text-muted-foreground text-lg max-w-md mb-12">
          {slides[currentSlide].description}
        </p>

        {/* Dots Indicator */}
        <div className="flex gap-2 mb-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="w-full max-w-md space-y-3">
          {currentSlide === slides.length - 1 ? (
            <Link to="/signup" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow">
                Get Started
              </Button>
            </Link>
          ) : (
            <Button 
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow"
            >
              Next
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
