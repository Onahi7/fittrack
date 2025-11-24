import { Button } from "@/components/ui/button";
import { Camera, Upload, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMeals } from "@/hooks/useFirestore";
import { uploadMealImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";

const LogMeal = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calories, setCalories] = useState<number | null>(null);
  const [mealType, setMealType] = useState<string>("Breakfast");
  const { currentUser } = useAuth();
  const { addMeal } = useMeals();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        simulateAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setCalories(Math.floor(Math.random() * 400) + 200);
      setAnalyzing(false);
    }, 2000);
  };

  const handleSaveMeal = async () => {
    if (!currentUser || !imageFile || calories === null) return;

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      toast({
        title: "Cloudinary not configured",
        description: "Please add your Cloudinary credentials to .env file. See CLOUDINARY_SETUP.md",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadMealImage(imageFile, currentUser.uid);

      // Save meal to Firestore
      await addMeal({
        type: mealType,
        imageUrl,
        calories,
        notes: '',
      });

      toast({
        title: "Meal logged!",
        description: `${mealType} saved with ${calories} calories.`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving meal:', error);
      toast({
        title: "Error saving meal",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to="/">
          <Button variant="ghost" size="icon" className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Log Your Meal</h1>
      </div>

      <div className="px-6">
        {!image ? (
          /* Upload Section */
          <div className="bg-card rounded-3xl p-8 shadow-card border-2 border-dashed border-border hover:border-primary transition-smooth">
            <div className="flex flex-col items-center justify-center gap-6 py-12">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-12 h-12 text-primary" />
              </div>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Tap to upload or take a photo</h2>
                <p className="text-muted-foreground">
                  Add a photo of your meal to get an AI-powered calorie estimate.
                </p>
              </div>

              <label htmlFor="file-upload" className="w-full">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
              </label>
            </div>
          </div>
        ) : (
          /* Analysis Section */
          <div className="space-y-6">
            <div className="relative rounded-3xl overflow-hidden shadow-card">
              <img 
                src={image} 
                alt="Meal" 
                className="w-full aspect-square object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">Analyzing your meal...</p>
                  </div>
                </div>
              )}
            </div>

            {calories !== null && !analyzing && (
              <div className="bg-gradient-primary rounded-3xl p-8 shadow-glow text-center">
                <p className="text-primary-foreground/80 text-sm mb-2">Estimated Calories</p>
                <p className="text-5xl font-bold text-primary-foreground mb-2">{calories}</p>
                <p className="text-primary-foreground/60 text-xs">
                  This is an AI-powered estimate. Actual values may vary.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline"
                className="flex-1 rounded-2xl h-14 border-border hover:border-primary transition-smooth"
                onClick={() => {
                  setImage(null);
                  setImageFile(null);
                  setCalories(null);
                }}
                disabled={saving}
              >
                Retake
              </Button>
              
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow"
                disabled={analyzing || calories === null || saving}
                onClick={handleSaveMeal}
              >
                {saving ? "Saving..." : "Save to Diary"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogMeal;
