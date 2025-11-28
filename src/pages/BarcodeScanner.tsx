import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scan, Loader2, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMeals } from "@/hooks/useFirestore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PremiumGate } from "@/components/PremiumGate";
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import { motion } from "framer-motion";

interface ScannedProduct {
  product_name: string;
  brands?: string;
  nutriments: {
    energy_kcal: number;
    proteins: number;
    carbohydrates: number;
    fat: number;
  };
  image_url?: string;
}

const BarcodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [mealType, setMealType] = useState<string>("Breakfast");
  const { toast } = useToast();
  const { addMeal } = useMeals();
  const navigate = useNavigate();

  const searchBarcode = async () => {
    if (!barcode.trim()) {
      toast({
        title: "Enter a barcode",
        description: "Please enter a valid barcode number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Open Food Facts API
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await response.json();

      if (data.status === 1 && data.product) {
        setProduct(data.product);
      } else {
        toast({
          title: "Product not found",
          description: "This barcode is not in our database",
          variant: "destructive",
        });
        setProduct(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to fetch product information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!product) return;

    try {
      await addMeal({
        type: mealType,
        calories: product.nutriments.energy_kcal || 0,
        protein: product.nutriments.proteins || 0,
        carbs: product.nutriments.carbohydrates || 0,
        fat: product.nutriments.fat || 0,
        imageUrl: product.image_url,
        notes: `${product.product_name}${product.brands ? ` - ${product.brands}` : ""}`,
      });

      toast({
        title: "Meal added!",
        description: `${product.product_name} logged successfully`,
      });

      navigate("/");
    } catch (error) {
      console.error("Error adding meal:", error);
      toast({
        title: "Error",
        description: "Failed to add meal",
        variant: "destructive",
      });
    }
  };

  return (
    <PageTransition>
      <PremiumGate feature="barcode_scanner" tier="premium">
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
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-heading">Barcode Scanner</h1>
                <p className="text-muted-foreground text-sm">
                  Scan packaged foods to instantly log nutrition
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 space-y-6">
            {/* Scanner Placeholder */}
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 shadow-card border border-border/50">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
                  <Scan className="w-16 h-16 text-primary" />
                </div>
                <p className="text-center text-muted-foreground mb-4">
                  Camera scanner coming soon!
                  <br />
                  For now, enter barcode manually
                </p>
              </div>
            </div>

            {/* Manual Barcode Entry */}
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
              <Label htmlFor="barcode" className="text-sm font-medium mb-2 block">
                Enter Barcode Number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  type="text"
                  placeholder="e.g., 3017620422003"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="flex-1 h-12 rounded-2xl bg-background/50 border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  onKeyDown={(e) => e.key === "Enter" && searchBarcode()}
                />
                <Button
                  onClick={searchBarcode}
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-6 h-12 shadow-glow"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Find the barcode on the product packaging (usually 13 digits)
              </p>
            </div>

            {/* Product Result */}
            {product && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50 space-y-4"
              >
                <div className="flex gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.product_name}
                      className="w-24 h-24 object-cover rounded-2xl shadow-sm"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 font-heading">
                      {product.product_name}
                    </h3>
                    {product.brands && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.brands}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nutrition Info */}
                <div className="bg-secondary/50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Calories</span>
                    <span className="font-semibold">
                      {Math.round(product.nutriments.energy_kcal || 0)} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Protein</span>
                    <span className="font-semibold">
                      {product.nutriments.proteins?.toFixed(1) || 0}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Carbs</span>
                    <span className="font-semibold">
                      {product.nutriments.carbohydrates?.toFixed(1) || 0}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Fats</span>
                    <span className="font-semibold">
                      {product.nutriments.fat?.toFixed(1) || 0}g
                    </span>
                  </div>
                </div>

                {/* Meal Type Selection */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Meal Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Breakfast", "Lunch", "Dinner", "Snack"].map((type) => (
                      <Button
                        key={type}
                        variant={mealType === type ? "default" : "outline"}
                        onClick={() => setMealType(type)}
                        className={`rounded-2xl h-10 transition-all ${
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

                {/* Add Button */}
                <Button
                  onClick={handleAddMeal}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 shadow-glow transition-all hover:shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Meal Log
                </Button>
              </motion.div>
            )}

            {/* Example Barcodes */}
            <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-4 border border-border/30">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Try these example barcodes:
              </p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  • <span className="font-mono bg-secondary/50 px-1 rounded">3017620422003</span> - Nutella
                </p>
                <p className="text-xs text-muted-foreground">
                  • <span className="font-mono bg-secondary/50 px-1 rounded">5000159484695</span> - Snickers
                </p>
                <p className="text-xs text-muted-foreground">
                  • <span className="font-mono bg-secondary/50 px-1 rounded">0078742137728</span> - Cheerios
                </p>
              </div>
            </div>
          </div>
          
          <BottomNav />
        </div>
      </PremiumGate>
    </PageTransition>
  );
};

export default BarcodeScanner;
