import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { WeightUnitProvider } from "@/contexts/WeightUnitContext";
import { AdminAuthProvider } from "@/admin/contexts/AdminAuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/admin/components/AdminProtectedRoute";
import PremiumChallengeBanner from "@/components/PremiumChallengeBanner";
import { usePremiumChallengeBanner } from "@/hooks/usePremiumChallengeBanner";
import AdminLayout from "@/admin/layouts/AdminLayout";
import AdminLogin from "@/admin/pages/AdminLogin";
import AdminDashboard from "@/admin/pages/AdminDashboard";
import UsersManagement from "@/admin/pages/UsersManagement";
import SubscriptionsManagement from "@/admin/pages/SubscriptionsManagement";
import ChallengesManagement from "@/admin/pages/ChallengesManagement";
import Home from "./pages/Home";
import Journal from "./pages/Journal";
import LogMeal from "./pages/LogMeal";
import WeeklyCheckIn from "./pages/WeeklyCheckIn";
import Progress from "./pages/Progress";
import Welcome from "./pages/Welcome";
import Setup from "./pages/Setup";
import MealHistory from "./pages/MealHistory";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import WaterTracker from "./pages/WaterTracker";
import Community from "./pages/Community";
import Feed from "./pages/community/Feed";
import Challenges from "./pages/community/Challenges";
import ChallengeDaily from "./pages/community/ChallengeDaily";
import Groups from "./pages/community/Groups";
import Friends from "./pages/community/Friends";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/profile/Privacy";
import Notifications from "./pages/profile/Notifications";
import Help from "./pages/profile/Help";
import EditProfile from "./pages/profile/EditProfile";
import ProgressPhotos from "./pages/ProgressPhotos";
import Buddies from "./pages/Buddies";
import Reports from "./pages/Reports";
import BarcodeScanner from "./pages/BarcodeScanner";
import FastingTimer from "./pages/FastingTimer";
import Premium from "./pages/Premium";
import MealPlanner from "./pages/MealPlanner";
import SubscriptionCallback from "./pages/SubscriptionCallback";

const queryClient = new QueryClient();

function UserApp() {
  const { currentBanner, dismissBanner, handleBannerJoin } = usePremiumChallengeBanner();
  
  return (
    <>
      <AnimatedRoutes />
      {currentBanner && (
        <PremiumChallengeBanner
          challenge={currentBanner}
          onDismiss={dismissBanner}
          onJoin={handleBannerJoin}
        />
      )}
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/setup" element={<Setup />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
            <Route path="/log-meal" element={<ProtectedRoute><LogMeal /></ProtectedRoute>} />
            <Route path="/weekly-checkin" element={<ProtectedRoute><WeeklyCheckIn /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/meal-history" element={<ProtectedRoute><MealHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            <Route path="/profile/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
            <Route path="/profile/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/water-tracker" element={<ProtectedRoute><WaterTracker /></ProtectedRoute>} />
            <Route path="/progress-photos" element={<ProtectedRoute><ProgressPhotos /></ProtectedRoute>} />
            <Route path="/buddies" element={<ProtectedRoute><Buddies /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/barcode-scanner" element={<ProtectedRoute><BarcodeScanner /></ProtectedRoute>} />
            <Route path="/fasting-timer" element={<ProtectedRoute><FastingTimer /></ProtectedRoute>} />
            <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
            <Route path="/meal-planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
            <Route path="/subscription/callback" element={<ProtectedRoute><SubscriptionCallback /></ProtectedRoute>} />
            
            {/* Community Routes */}
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/community/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/community/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/challenges/:id/daily" element={<ProtectedRoute><ChallengeDaily /></ProtectedRoute>} />
            <Route path="/community/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            <Route path="/community/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes - Separate Auth Context */}
          <Route
            path="/admin/*"
            element={
              <AdminAuthProvider>
                <Routes>
                  <Route path="login" element={<AdminLogin />} />
                  <Route
                    path="*"
                    element={
                      <AdminProtectedRoute>
                        <AdminLayout />
                      </AdminProtectedRoute>
                    }
                  >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UsersManagement />} />
                    <Route path="subscriptions" element={<SubscriptionsManagement />} />
                    <Route path="challenges" element={<ChallengesManagement />} />
                    <Route path="meals" element={<div className="p-6">Meals Management - Coming Soon</div>} />
                    <Route path="journal" element={<div className="p-6">Journal Management - Coming Soon</div>} />
                    <Route path="water" element={<div className="p-6">Water Tracking - Coming Soon</div>} />
                    <Route path="analytics" element={<div className="p-6">Analytics - Coming Soon</div>} />
                    <Route path="settings" element={<div className="p-6">Settings - Coming Soon</div>} />
                  </Route>
                </Routes>
              </AdminAuthProvider>
            }
          />

          {/* User Routes - Firebase Auth Context */}
          <Route
            path="*"
            element={
              <AuthProvider>
                <SubscriptionProvider>
                  <WeightUnitProvider>
                    <TooltipProvider>
                      <Toaster />
                      <Sonner />
                      <UserApp />
                    </TooltipProvider>
                  </WeightUnitProvider>
                </SubscriptionProvider>
              </AuthProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
