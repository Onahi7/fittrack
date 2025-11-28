import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, EyeOff, Download, Trash2, Lock, Globe, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PageTransition } from '@/components/animations/PageTransition';
import BottomNav from '@/components/BottomNav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Privacy = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [profileVisibility, setProfileVisibility] = useState<'private' | 'friends' | 'public'>('friends');
  const [showProgressPhotos, setShowProgressPhotos] = useState(true);
  const [showMeals, setShowMeals] = useState(true);
  const [showWeight, setShowWeight] = useState(false);
  const [allowBuddyRequests, setAllowBuddyRequests] = useState(true);
  const [showInLeaderboards, setShowInLeaderboards] = useState(true);

  const handleExportData = async () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Your Personal Data Export', 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
      doc.text(`User: ${currentUser?.email || 'N/A'}`, 14, 40);
      
      doc.setFontSize(14);
      doc.text('Privacy Settings', 14, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['Setting', 'Value']],
        body: [
          ['Profile Visibility', profileVisibility],
          ['Show Progress Photos', showProgressPhotos ? 'Yes' : 'No'],
          ['Show Meals', showMeals ? 'Yes' : 'No'],
          ['Show Weight', showWeight ? 'Yes' : 'No'],
          ['Allow Buddy Requests', allowBuddyRequests ? 'Yes' : 'No'],
          ['Show in Leaderboards', showInLeaderboards ? 'Yes' : 'No'],
        ],
      });
      
      doc.save(`privacy-settings-${new Date().getTime()}.pdf`);
      
      toast({
        title: "Data Exported",
        description: "Your privacy settings have been exported as PDF",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export your data",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // In a real implementation, this would call the backend API
      // const token = await currentUser?.getIdToken();
      // await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      //   method: 'DELETE',
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      
      toast({
        title: "Account Deletion Requested",
        description: "We're processing your request. This may take up to 30 days as per GDPR requirements.",
        variant: "destructive",
      });
      
      // Sign out after 3 seconds
      setTimeout(() => {
        window.location.href = '/welcome';
      }, 3000);
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const visibilityOptions = [
    { value: 'private', icon: Lock, label: 'Private', description: 'Only you can see your data' },
    { value: 'friends', icon: Users, label: 'Buddies Only', description: 'Only your accountability buddies' },
    { value: 'public', icon: Globe, label: 'Community', description: 'Visible to all community members' },
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
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="mb-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-heading">Privacy & Security</h1>
              <p className="text-muted-foreground text-sm">Manage your data and privacy</p>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Profile Visibility */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold mb-4 font-heading">Profile Visibility</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Choose who can see your profile and activity
            </p>
            
            <div className="space-y-3">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = profileVisibility === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setProfileVisibility(option.value as any)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-glow' 
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What to Share */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold mb-4 font-heading">What to Share</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Control what information is visible to others
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="progress-photos" className="font-semibold">Progress Photos</Label>
                  <p className="text-sm text-muted-foreground">Show your transformation photos</p>
                </div>
                <Switch
                  id="progress-photos"
                  checked={showProgressPhotos}
                  onCheckedChange={setShowProgressPhotos}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="meals" className="font-semibold">Meal Logs</Label>
                  <p className="text-sm text-muted-foreground">Share your daily meals</p>
                </div>
                <Switch
                  id="meals"
                  checked={showMeals}
                  onCheckedChange={setShowMeals}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="weight" className="font-semibold">Weight & Measurements</Label>
                  <p className="text-sm text-muted-foreground">Display weight tracking data</p>
                </div>
                <Switch
                  id="weight"
                  checked={showWeight}
                  onCheckedChange={setShowWeight}
                />
              </div>
            </div>
          </div>

          {/* Community Settings */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold mb-4 font-heading">Community Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="buddy-requests" className="font-semibold">Allow Buddy Requests</Label>
                  <p className="text-sm text-muted-foreground">Let others send you accountability buddy requests</p>
                </div>
                <Switch
                  id="buddy-requests"
                  checked={allowBuddyRequests}
                  onCheckedChange={setAllowBuddyRequests}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="leaderboards" className="font-semibold">Show in Leaderboards</Label>
                  <p className="text-sm text-muted-foreground">Appear in community rankings and challenges</p>
                </div>
                <Switch
                  id="leaderboards"
                  checked={showInLeaderboards}
                  onCheckedChange={setShowInLeaderboards}
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-card border border-border/50">
            <h2 className="text-xl font-semibold mb-4 font-heading">Data Management</h2>
            <p className="text-muted-foreground text-sm mb-4">
              GDPR Compliant - You have full control over your data
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="w-full h-14 rounded-2xl justify-start hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
              >
                <Download className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Export My Data</div>
                  <div className="text-xs text-muted-foreground">Download all your data in PDF format</div>
                </div>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl justify-start border-destructive/50 hover:bg-destructive/5 hover:text-destructive transition-all duration-300"
                  >
                    <Trash2 className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Delete My Account</div>
                      <div className="text-xs text-muted-foreground">Permanently remove all your data</div>
                    </div>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-heading">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers. As per GDPR requirements, this
                      process may take up to 30 days to complete.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="rounded-2xl bg-destructive hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-info/10 rounded-3xl p-6 border border-info/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-info mt-1" />
              <div>
                <h3 className="font-semibold mb-2 text-info font-heading">Your Data is Secure</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  All your data is encrypted and stored securely. We're GDPR compliant and never
                  share your personal information without your explicit consent.
                </p>
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default Privacy;
