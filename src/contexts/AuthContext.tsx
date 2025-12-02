import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<import('firebase/auth').UserCredential>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<import('firebase/auth').UserCredential>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to sync user to backend database
const syncUserToBackend = async (user: User) => {
  try {
    await api.users.create({
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || undefined,
      photoURL: user.photoURL || undefined,
    });
    // User synced to backend database
  } catch (error: any) {
    // 409 Conflict means user already exists, which is fine
    // 401 Unauthorized might happen if Firebase auth guard is not set up yet
    if (error?.response?.status === 409 || error?.response?.status === 401) {
      // User already exists in database or auth not configured
    } else {
      console.error('Error syncing user to backend:', error);
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        // Sync new user to backend database
        await syncUserToBackend(userCredential.user);
      }
    } catch (error: unknown) {
      console.error('Firebase signup error:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please enable it in Firebase Console.');
      }
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Ensure user exists in backend database on login
    await syncUserToBackend(userCredential.user);
    return userCredential;
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Use redirect instead of popup for better performance on free tier
      await signInWithRedirect(auth, provider);
      // The actual sign-in will be handled by getRedirectResult in useEffect
      return Promise.resolve({} as any); // Return empty promise, actual result handled after redirect
    } catch (error: any) {
      console.error('[Auth] Google login error:', error);
      console.error('[Auth] Error code:', error.code);
      console.error('[Auth] Error message:', error.message);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    let handledRedirect = false;

    // Handle redirect result from Google sign-in
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user && !handledRedirect) {
          handledRedirect = true;
          console.log('[Auth] Google redirect successful, syncing to backend...');
          await syncUserToBackend(result.user);
          console.log('[Auth] Google user synced to backend');
          
          // Small delay to ensure backend sync completes
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if this is a new user or returning user
          const { getUserProfile } = await import('@/lib/userProfile');
          try {
            const profile = await getUserProfile(result.user.uid);
            const hasCompletedSetup = profile && (profile.setupCompleted || (profile.startingWeight && profile.goalWeight));
            
            console.log('[Auth] Profile check:', { hasProfile: !!profile, hasCompletedSetup });
            
            // Navigate based on setup status
            if (!hasCompletedSetup) {
              console.log('[Auth] Navigating to setup...');
              window.location.replace('/setup');
            } else {
              console.log('[Auth] Navigating to home...');
              window.location.replace('/');
            }
          } catch (error) {
            console.log('[Auth] No profile found, navigating to setup...');
            // If profile doesn't exist, send to setup
            window.location.replace('/setup');
          }
        }
      } catch (error) {
        console.error('[Auth] Error handling redirect result:', error);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !handledRedirect) {
        // Sync user to backend when auth state changes (e.g., page refresh)
        await syncUserToBackend(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    loginWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
