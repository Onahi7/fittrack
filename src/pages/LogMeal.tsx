import { Button } from "@/components/ui/button";
import { Camera, Upload, ArrowLeft, Loader2, Sparkles, Check, Plus, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMeals } from "@/hooks/useFirestore";
import { uploadMealImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";
import { geminiService } from "@/lib/gemini";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FoodItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// Helper to clean JSON from markdown code fences
const cleanJsonResponse = (text: string): string => {
  // Remove markdown code fences if present
  return text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
};

const LogMeal = () => {
  const [entryMode, setEntryMode] = useState<'photo' | 'manual'>('photo');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [calories, setCalories] = useState<number | null>(null);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [mealType, setMealType] = useState<string>("Breakfast");
  const [notes, setNotes] = useState<string>("");
  
  // Manual entry states
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentFood, setCurrentFood] = useState({ name: '', portion: '', calories: '' });
  
  const { currentUser } = useAuth();
  const { addMeal } = useMeals();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setImage(imageData);
        await analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageBase64: string) => {
    setAnalyzing(true);
    try {
      const result = await geminiService.analyzeMealPhoto(imageBase64);
      if (result.success) {
        const cleanedText = cleanJsonResponse(result.text);
        const data = JSON.parse(cleanedText);
        setCalories(data.estimatedCalories || 0);
        setProtein(data.protein || 0);
        setCarbs(data.carbs || 0);
        setFats(data.fats || 0);
        if (data.description) setNotes(data.description);
      } else {
        // Fallback to basic estimation if AI fails
        const estimatedCalories = 400;
        setCalories(estimatedCalories);
        setProtein(Math.floor(estimatedCalories * 0.25 / 4));
        setCarbs(Math.floor(estimatedCalories * 0.45 / 4));
        setFats(Math.floor(estimatedCalories * 0.30 / 9));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Fallback values
      const estimatedCalories = 400;
      setCalories(estimatedCalories);
      setProtein(Math.floor(estimatedCalories * 0.25 / 4));
      setCarbs(Math.floor(estimatedCalories * 0.45 / 4));
      setFats(Math.floor(estimatedCalories * 0.30 / 9));
    } finally {
      setAnalyzing(false);
    }
  };

  const addFoodItem = () => {
    if (!currentFood.name || !currentFood.portion) {
      toast({
        title: "Missing information",
        description: "Please provide food name and portion",
        variant: "destructive",
      });
      return;
    }

    // If calories provided, validate it
    if (currentFood.calories) {
      const caloriesNum = parseInt(currentFood.calories);
      if (isNaN(caloriesNum) || caloriesNum < 0) {
        toast({
          title: "Invalid calories",
          description: "Please enter a valid number",
          variant: "destructive",
        });
        return;
      }
    }

    // If calories not provided, use AI to estimate
    if (!currentFood.calories) {
      estimateAndAddFood();
    } else {
      addFoodItemDirectly(parseInt(currentFood.calories));
    }
  };

  const estimateAndAddFood = async () => {
    setSaving(true);
    toast({
      title: "Estimating calories...",
      description: "Using AI to analyze nutrition",
    });

    try {
      const result = await geminiService.estimateFoodCalories({
        foodName: currentFood.name,
        portion: currentFood.portion,
      });

      if (result.success) {
        const cleanedText = cleanJsonResponse(result.text);
        const data = JSON.parse(cleanedText);
        addFoodItemDirectly(
          data.estimatedCalories,
          data.protein,
          data.carbs,
          data.fats
        );
        
        toast({
          title: "AI Estimate Complete",
          description: `${data.estimatedCalories} cal (${data.confidence} confidence)`,
        });
      } else {
        // Fallback estimate
        addFoodItemDirectly(200);
        toast({
          title: "Using default estimate",
          description: "AI unavailable, used 200 cal estimate",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error estimating calories:', error);
      addFoodItemDirectly(200);
      toast({
        title: "Using default estimate",
        description: "AI unavailable, used 200 cal estimate",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addFoodItemDirectly = (
    caloriesNum: number,
    proteinGrams?: number,
    carbsGrams?: number,
    fatsGrams?: number
  ) => {
    // Calculate macros if not provided
    const finalProtein = proteinGrams ?? Math.round(caloriesNum * 0.25 / 4);
    const finalCarbs = carbsGrams ?? Math.round(caloriesNum * 0.45 / 4);
    const finalFats = fatsGrams ?? Math.round(caloriesNum * 0.30 / 9);

    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: currentFood.name,
      portion: currentFood.portion,
      calories: caloriesNum,
      protein: finalProtein,
      carbs: finalCarbs,
      fats: finalFats,
    };

    setFoodItems([...foodItems, newItem]);
    setCurrentFood({ name: '', portion: '', calories: '' });

    // Update totals
    const totalCals = [...foodItems, newItem].reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = [...foodItems, newItem].reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = [...foodItems, newItem].reduce((sum, item) => sum + item.carbs, 0);
    const totalFats = [...foodItems, newItem].reduce((sum, item) => sum + item.fats, 0);

    setCalories(totalCals);
    setProtein(totalProtein);
    setCarbs(totalCarbs);
    setFats(totalFats);
  };

  const removeFoodItem = (id: string) => {
    const updatedItems = foodItems.filter(item => item.id !== id);
    setFoodItems(updatedItems);

    // Recalculate totals
    const totalCals = updatedItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = updatedItems.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = updatedItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFats = updatedItems.reduce((sum, item) => sum + item.fats, 0);

    setCalories(totalCals || null);
    setProtein(totalProtein);
    setCarbs(totalCarbs);
    setFats(totalFats);
  };

  const handleSaveMeal = async () => {
    if (!currentUser || calories === null) return;

    // For photo mode, check Cloudinary configuration
    if (entryMode === 'photo' && !imageFile) return;
    
    if (entryMode === 'photo' && !isCloudinaryConfigured()) {
      toast({
        title: "Cloudinary not configured",
        description: "Please add your Cloudinary credentials to .env file. See CLOUDINARY_SETUP.md",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = undefined;

      // Upload image only if in photo mode
      if (entryMode === 'photo' && imageFile) {
        imageUrl = await uploadMealImage(imageFile, currentUser.uid);
      }

      // Create meal name from food items if in manual mode
      const mealName = entryMode === 'manual' && foodItems.length > 0
        ? foodItems.map(item => `${item.name} (${item.portion})`).join(', ')
        : mealType;

      // Save meal to backend API
      await addMeal({
        name: mealName,
        mealType: mealType.toLowerCase(),
        imageUrl,
        calories,
        protein,
        carbs,
        fats,
        notes: entryMode === 'manual' 
          ? `${foodItems.map(item => `${item.name}: ${item.portion} - ${item.calories} kcal`).join('\n')}\n${notes}`.trim()
          : notes,
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
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading">Log Meal</h1>
              <p className="text-muted-foreground text-sm">
                Snap a photo or enter details manually
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 mt-6 bg-card/50 p-1.5 rounded-2xl border border-border/50">
            <Button
              variant={entryMode === 'photo' ? 'default' : 'ghost'}
              onClick={() => setEntryMode('photo')}
              className={`rounded-xl h-10 transition-all ${
                entryMode === 'photo'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'hover:bg-background/80'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
            <Button
              variant={entryMode === 'manual' ? 'default' : 'ghost'}
              onClick={() => setEntryMode('manual')}
              className={`rounded-xl h-10 transition-all ${
                entryMode === 'manual'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'hover:bg-background/80'
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Manual
            </Button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {entryMode === 'photo' ? (
            /* PHOTO MODE */
            <>
              {!image ? (
                /* Upload Section */
                <div 
              className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-border/50 hover:bg-card/60 transition-colors relative overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-12 h-12 text-primary" />
                </div>
                
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2 font-heading">Tap to upload or take a photo</h2>
                  <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    Add a photo of your meal to get an AI-powered calorie estimate.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button 
                  type="button"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
              </div>
            </div>
          ) : (
            /* Analysis Section */
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-card border border-border/50">
                <img 
                  src={image} 
                  alt="Meal" 
                  className="w-full aspect-square object-cover"
                />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-semibold text-white animate-pulse">Analyzing with AI...</p>
                  </div>
                )}
                <div className="absolute bottom-4 right-4">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="rounded-xl backdrop-blur-md bg-black/30 text-white hover:bg-black/50 border-none"
                    onClick={() => {
                      setImage(null);
                      setImageFile(null);
                      setCalories(null);
                    }}
                  >
                    Retake
                  </Button>
                </div>
              </div>

              {calories !== null && !analyzing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 shadow-glow text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                        <Sparkles className="w-4 h-4 text-white" />
                        <p className="text-white text-sm font-medium">AI Estimate</p>
                      </div>
                      <p className="text-6xl font-bold text-white mb-2 tracking-tight">{calories}</p>
                      <p className="text-white/70 text-xs">Calories</p>
                    </div>
                  </div>

                  {/* Meal Type Selection */}
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                        <Button
                          key={type}
                          variant={mealType === type ? "default" : "outline"}
                          onClick={() => setMealType(type)}
                          className={`rounded-xl h-10 text-xs sm:text-sm transition-all ${
                            mealType === type 
                              ? "bg-primary text-primary-foreground shadow-glow" 
                              : "bg-background/50 hover:bg-background/80 border-border/50"
                          }`}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Macro Breakdown */}
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <p className="font-semibold mb-4 font-heading">Macro Breakdown</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-500/10 rounded-2xl p-4 text-center border border-green-500/20">
                        <p className="text-2xl font-bold text-green-600">{protein}g</p>
                        <p className="text-xs text-muted-foreground mt-1">Protein</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-2xl p-4 text-center border border-orange-500/20">
                        <p className="text-2xl font-bold text-orange-600">{carbs}g</p>
                        <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                      </div>
                      <div className="bg-red-500/10 rounded-2xl p-4 text-center border border-red-500/20">
                        <p className="text-2xl font-bold text-red-600">{fats}g</p>
                        <p className="text-xs text-muted-foreground mt-1">Fats</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional details..."
                      className="bg-background/50 border-border/50 focus:border-primary min-h-[100px] rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow text-lg"
                    disabled={analyzing || calories === null || saving}
                    onClick={handleSaveMeal}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Save to Diary
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
            </>
          ) : (
            /* MANUAL ENTRY MODE */
            <div className="space-y-6">
              {/* Add Food Item Form */}
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                <h2 className="text-lg font-semibold mb-4 font-heading">Add Food Items</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="foodName" className="text-sm font-medium mb-2 block">Food Name</Label>
                    <Input
                      id="foodName"
                      value={currentFood.name}
                      onChange={(e) => setCurrentFood({...currentFood, name: e.target.value})}
                      placeholder="e.g., Rice, Chicken, Salad"
                      className="bg-background/50 border-border/50 focus:border-primary rounded-xl h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="portion" className="text-sm font-medium mb-2 block">Portion</Label>
                      <Input
                        id="portion"
                        value={currentFood.portion}
                        onChange={(e) => setCurrentFood({...currentFood, portion: e.target.value})}
                        placeholder="e.g., 2 cups, 1 piece"
                        className="bg-background/50 border-border/50 focus:border-primary rounded-xl h-12"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="calories" className="text-sm font-medium mb-2 block">
                        Calories <span className="text-xs text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="calories"
                        type="number"
                        value={currentFood.calories}
                        onChange={(e) => setCurrentFood({...currentFood, calories: e.target.value})}
                        placeholder="AI will estimate"
                        className="bg-background/50 border-border/50 focus:border-primary rounded-xl h-12"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      {currentFood.calories 
                        ? "Using your calorie input" 
                        : "Leave blank to use AI estimation based on food and portion"}
                    </p>
                  </div>

                  <Button
                    onClick={addFoodItem}
                    disabled={saving}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-12"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Estimating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Food Items List */}
              {foodItems.length > 0 && (
                <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                  <h3 className="text-lg font-semibold mb-4 font-heading">Your Meal</h3>
                  <div className="space-y-3">
                    {foodItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-background/50 rounded-xl p-4 border border-border/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{item.name}</p>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {item.portion}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="font-bold text-primary">{item.calories} kcal</span>
                              <span>P: {item.protein}g</span>
                              <span>C: {item.carbs}g</span>
                              <span>F: {item.fats}g</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFoodItem(item.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              {calories !== null && foodItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 shadow-glow text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-[1px]" />
                    <div className="relative z-10">
                      <p className="text-white text-sm font-medium mb-2 opacity-80">Total</p>
                      <p className="text-6xl font-bold text-white mb-2 tracking-tight">{calories}</p>
                      <p className="text-white/70 text-xs">Calories</p>
                    </div>
                  </div>

                  {/* Meal Type Selection */}
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <Label className="text-sm font-medium mb-3 block">Meal Type</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                        <Button
                          key={type}
                          variant={mealType === type ? "default" : "outline"}
                          onClick={() => setMealType(type)}
                          className={`rounded-xl h-10 text-xs sm:text-sm transition-all ${
                            mealType === type 
                              ? "bg-primary text-primary-foreground shadow-glow" 
                              : "bg-background/50 hover:bg-background/80 border-border/50"
                          }`}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Macro Breakdown */}
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <p className="font-semibold mb-4 font-heading">Total Macros</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-green-500/10 rounded-2xl p-4 text-center border border-green-500/20">
                        <p className="text-2xl font-bold text-green-600">{protein}g</p>
                        <p className="text-xs text-muted-foreground mt-1">Protein</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-2xl p-4 text-center border border-orange-500/20">
                        <p className="text-2xl font-bold text-orange-600">{carbs}g</p>
                        <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                      </div>
                      <div className="bg-red-500/10 rounded-2xl p-4 text-center border border-red-500/20">
                        <p className="text-2xl font-bold text-red-600">{fats}g</p>
                        <p className="text-xs text-muted-foreground mt-1">Fats</p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
                    <Label htmlFor="notes" className="text-sm font-medium mb-2 block">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any additional details..."
                      className="bg-background/50 border-border/50 focus:border-primary min-h-[100px] rounded-xl resize-none"
                    />
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-2xl h-14 shadow-glow text-lg"
                    disabled={saving}
                    onClick={handleSaveMeal}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Save to Diary
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
        
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default LogMeal;
