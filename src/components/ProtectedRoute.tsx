import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/userProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);

  useEffect(() => {
    const checkSetupStatus = async () => {
      if (currentUser && !loading) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          const isSetupComplete = profile && (profile.setupCompleted || (profile.startingWeight && profile.goalWeight));
          setSetupCompleted(!!isSetupComplete);
        } catch (error) {
          console.error('Error checking setup status:', error);
          setSetupCompleted(false);
        }
        setCheckingSetup(false);
      }
    };

    if (currentUser && !loading) {
      checkSetupStatus();
    }
  }, [currentUser, loading]);

  // Show loading spinner while checking authentication status or setup status
  if (loading || (currentUser && checkingSetup)) {
    return <LoadingSpinner fullScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/welcome" replace />;
  }

  // Allow access to setup page even if setup is not completed
  if (location.pathname === '/setup') {
    return <>{children}</>;
  }

  // Redirect to setup if user hasn't completed setup
  if (!setupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
