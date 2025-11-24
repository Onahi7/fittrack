import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import Groups from "./pages/community/Groups";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
            <Route path="/water-tracker" element={<ProtectedRoute><WaterTracker /></ProtectedRoute>} />
            
            {/* Community Routes */}
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/community/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/community/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/community/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
