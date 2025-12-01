import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, RefreshCw, Plus, ChefHat, Clock, Flame, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { PremiumGate } from "@/components/PremiumGate";
import { geminiService } from "@/lib/gemini";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";

interface Recipe {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: number;
  difficulty: string;
  tags: string[];
  ingredients?: string[];
  instructions?: string[];
}

const MealPlanner = () => {
  const { toast } = useToast();
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [dietPreference, setDietPreference] = useState("balanced");
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);

  const dietTypes = [
    { id: "balanced", label: "Balanced", emoji: "⚖️" },
    { id: "low-carb", label: "Low Carb", emoji: "🥩" },
    { id: "high-protein", label: "High Protein", emoji: "💪" },
    { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
    { id: "vegan", label: "Vegan", emoji: "🌱" },
    { id: "keto", label: "Keto", emoji: "🥑" },
  ];



  const generateMealPlan = async () => {
    setGenerating(true);
    
    try {
      // Use Gemini AI to generate meal suggestions
      const response = await geminiService.generateMealSuggestions({
        calorieTarget,
        dietType: dietPreference,
      });

      if (response.success && response.text) {
        try {
          // Parse the JSON response from Gemini
          const meals = JSON.parse(response.text) as Array<{
            name: string;
            emoji?: string;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            prepTime?: number;
            ingredients?: string[];
            instructions?: string[];
          }>;
          
          // Transform Gemini response to Recipe format
          const aiRecipes: Recipe[] = meals.map((meal, index) => ({
            id: `ai-${index}`,
            name: meal.name,
            image: meal.emoji || "🍽️",
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            prepTime: meal.prepTime || 30,
            difficulty: "Medium",
            tags: [dietPreference, "AI Generated"],
            ingredients: meal.ingredients,
            instructions: meal.instructions,
          }));

          setSuggestions(aiRecipes);
          toast({
            title: "✨ AI Meal Plan Generated!",
            description: `Created ${aiRecipes.length} personalized meals for you`,
          });
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          handleGenerationFailure();
        }
      } else {
        // AI generation failed
        handleGenerationFailure();
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      handleGenerationFailure();
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerationFailure = () => {
    setSuggestions([]);
    toast({
      title: "Generation Failed",
      description: "Unable to generate meal suggestions. Please try again later.",
      variant: "destructive",
    });
  };

  return (
    <PageTransition>
      <PremiumGate feature="meal_planner" tier="premium">
        <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
          {/* Background Gradients */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/5 blur-[100px]" />
          </div>

          {/* Header */}
          <div className="px-6 pt-8 pb-6">
            <Link to="/">
              <Button variant="ghost" size="icon" className="mb-4">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading">AI Meal Planner</h1>
                <p className="text-muted-foreground text-sm">Personalized recipe suggestions</p>
              </div>
            </div>
          </div>

          <div className="px-6 space-y-6">
            {/* Preferences */}
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 space-y-4">
              <h3 className="font-semibold text-lg font-heading">Your Preferences</h3>

              {/* Calorie Target */}
              <div>
                <Label htmlFor="calories" className="mb-2 block">
                  Daily Calorie Target
                </Label>
                <Input
                  id="calories"
                  type="number"
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
                  className="h-12 rounded-2xl bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Diet Type */}
              <div>
                <Label className="mb-3 block">Diet Preference</Label>
                <div className="grid grid-cols-2 gap-2">
                  {dietTypes.map((diet) => (
                    <Button
                      key={diet.id}
                      variant={dietPreference === diet.id ? "default" : "outline"}
                      onClick={() => setDietPreference(diet.id)}
                      className={`rounded-2xl h-12 justify-start transition-all ${
                        dietPreference === diet.id 
                          ? "bg-primary text-primary-foreground shadow-glow" 
                          : "bg-background/50 hover:bg-background/80 border-border/50"
                      }`}
                    >
                      <span className="mr-2">{diet.emoji}</span>
                      {diet.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateMealPlan}
                disabled={generating}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold rounded-2xl h-12 shadow-lg shadow-orange-500/20 transition-all hover:shadow-orange-500/30 disabled:opacity-70"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate AI Meal Plan
                  </>
                )}
              </Button>
            </div>

            {/* Suggestions */}
            {generating && (
              <div className="space-y-4 animate-in fade-in duration-500">
                <h3 className="font-semibold text-lg font-heading">Generating AI Suggestions...</h3>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-card border border-border/50">
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-muted/50 rounded-2xl animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted/50 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-16 bg-muted/50 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!generating && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg font-heading">
                    Suggested Meals
                    <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">✨ AI Generated</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateMealPlan}
                    className="text-primary hover:bg-primary/10 transition-colors rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                {suggestions.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card/50 backdrop-blur-sm rounded-3xl p-5 shadow-card border border-border/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 shadow-inner">
                        {recipe.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1 font-heading">{recipe.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            {recipe.prepTime} min
                          </span>
                          <span className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                            <Flame className="w-3 h-3" />
                            {recipe.calories} cal
                          </span>
                          <span className="bg-secondary/50 px-2 py-1 rounded-lg">{recipe.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Protein</p>
                        <p className="font-semibold text-green-600">{recipe.protein}g</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-xl p-3 text-center border border-orange-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                        <p className="font-semibold text-orange-600">{recipe.carbs}g</p>
                      </div>
                      <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                        <p className="text-xs text-muted-foreground mb-1">Fats</p>
                        <p className="font-semibold text-red-600">{recipe.fats}g</p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-secondary/50 border border-border/50 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-2xl h-10 border-border/50 hover:bg-secondary/50"
                        onClick={() =>
                          toast({
                            title: "Recipe details",
                            description: "Full recipe coming soon!",
                          })
                        }
                      >
                        View Recipe
                      </Button>
                      <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-10 shadow-glow"
                        onClick={() =>
                          toast({
                            title: "Added to meal plan!",
                            description: `${recipe.name} saved`,
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Plan
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {suggestions.length === 0 && !generating && (
              <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 shadow-card border border-border/50 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-heading">
                  AI-Powered Meal Planning
                </h3>
                <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
                  Set your preferences above and let AI create personalized meal suggestions
                  tailored to your goals
                </p>
              </div>
            )}
          </div>

          <BottomNav />
        </div>
      </PremiumGate>
    </PageTransition>
  );
};

export default MealPlanner;
