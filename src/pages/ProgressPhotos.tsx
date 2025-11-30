import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Calendar, TrendingDown, Eye, EyeOff, Trash2, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWeightUnit } from "@/contexts/WeightUnitContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from '@/components/animations/PageTransition';
import { motion } from "framer-motion";
import { useProgressPhotos } from '@/hooks/useProgressPhotos';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const ProgressPhotos = () => {
  const { toast } = useToast();
  const { formatWeight, unit } = useWeightUnit();
  const { photos, loading, error, createPhoto, deletePhoto } = useProgressPhotos();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [uploadWeight, setUploadWeight] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadVisibility, setUploadVisibility] = useState<'private' | 'buddy' | 'community'>('private');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      // For now, we'll use the base64 image as URL and generate a dummy cloudinary ID
      // In a real app, you'd upload to Cloudinary first and get the URL and public ID
      await createPhoto({
        url: selectedImage,
        cloudinaryPublicId: `progress_${Date.now()}`,
        date: new Date().toISOString(),
        weight: uploadWeight ? parseFloat(uploadWeight) : undefined,
        notes: uploadNotes || undefined,
        visibility: uploadVisibility,
      });

      setUploadDialogOpen(false);
      setSelectedImage('');
      setUploadWeight('');
      setUploadNotes('');
      setUploadVisibility('private');

      toast({
        title: "Photo uploaded!",
        description: "Your progress photo has been saved",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to save your photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startingPhoto = photos[photos.length - 1];
  const latestPhoto = photos[0];
  const weightLoss = startingPhoto?.weight && latestPhoto?.weight
    ? startingPhoto.weight - latestPhoto.weight
    : 0;

  // Show loading skeleton while fetching photos
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-8">
          <div className="px-6 pt-8 pb-6">
            <LoadingSkeleton className="w-8 h-8 rounded-lg mb-4" />
            <LoadingSkeleton className="w-48 h-8 rounded-lg mb-2" />
            <LoadingSkeleton className="w-32 h-4 rounded-lg" />
          </div>
          <div className="px-6 space-y-6">
            <LoadingSkeleton className="w-full h-64 rounded-3xl" />
            <LoadingSkeleton className="w-full h-96 rounded-3xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]" />
        </div>

        {/* Header */}
        <div className="px-6 pt-8 pb-6">
          <Link to="/progress">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold font-heading">Progress Photos</h1>
              <p className="text-muted-foreground text-sm">Track your transformation</p>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow">
                  <Camera className="w-5 h-5 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl border-border/50 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="font-heading">Upload Progress Photo</DialogTitle>
                  <DialogDescription>
                    Document your journey and track your transformation
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <Label htmlFor="photo">Photo</Label>
                    <div className="mt-2">
                      {selectedImage ? (
                        <div className="relative">
                          <img
                            src={selectedImage}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-2xl shadow-sm"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full shadow-sm"
                            onClick={() => setSelectedImage('')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor="photo"
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300"
                        >
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                            <ImageIcon className="w-8 h-8 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">Click to upload photo</span>
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Weight */}
                  <div>
                    <Label htmlFor="weight">Weight (optional)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="170"
                      value={uploadWeight}
                      onChange={(e) => setUploadWeight(e.target.value)}
                      className="rounded-2xl h-12 mt-2 bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="How are you feeling? Any milestones?"
                      value={uploadNotes}
                      onChange={(e) => setUploadNotes(e.target.value)}
                      className="rounded-2xl mt-2 min-h-[100px] bg-secondary/50 border-border/50 focus:border-primary resize-none"
                    />
                  </div>

                  {/* Visibility */}
                  <div>
                    <Label htmlFor="visibility">Who can see this?</Label>
                    <Select value={uploadVisibility} onValueChange={(value: any) => setUploadVisibility(value)}>
                      <SelectTrigger className="rounded-2xl h-12 mt-2 bg-secondary/50 border-border/50 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">🔒 Just Me</SelectItem>
                        <SelectItem value="buddy">👥 My Buddies</SelectItem>
                        <SelectItem value="community">🌍 Community</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleSavePhoto}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-12 shadow-glow"
                  >
                    Save Photo
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Before/After Comparison */}
          {photos.length >= 2 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
            >
              <h2 className="text-xl font-semibold mb-4 font-heading">Your Transformation</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Before */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Before</p>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={startingPhoto.url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <p className="text-white text-xs font-medium">{startingPhoto.weight && formatWeight(startingPhoto.weight)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">
                      {new Date(startingPhoto.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* After */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2 font-medium">Latest</p>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={latestPhoto.url}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                      <p className="text-white text-xs font-medium">{latestPhoto.weight && formatWeight(latestPhoto.weight)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">
                      {new Date(latestPhoto.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {weightLoss > 0 && (
                <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-700">Amazing Progress!</p>
                      <p className="text-sm text-green-600/80">
                        You've lost <span className="font-bold">{formatWeight(weightLoss)}</span> since you started!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-border/50"
          >
            <h2 className="text-xl font-semibold mb-4 font-heading">Timeline</h2>
            
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2 font-heading">No photos yet</h3>
                <p className="text-muted-foreground mb-6 text-sm max-w-[200px] mx-auto">
                  Start documenting your journey by uploading your first photo!
                </p>
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Upload First Photo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {photos.map((photo, index) => {
                  const Icon = photo.visibility === 'private' ? EyeOff : photo.visibility === 'buddy' ? Eye : ImageIcon;
                  
                  return (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-background/50 hover:border-primary/50 transition-all duration-300 group"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                        <img
                          src={photo.url}
                          alt={`Progress ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold font-heading">
                              {new Date(photo.date).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </p>
                            {photo.weight && (
                              <p className="text-sm text-primary font-medium">{formatWeight(photo.weight)}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                              {photo.visibility}
                            </span>
                          </div>
                        </div>
                        {photo.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{photo.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProgressPhotos;
