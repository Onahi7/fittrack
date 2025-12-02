import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { getUserProfile } from '@/lib/userProfile';

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
  const navigate = useNavigate();

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
      // Use popup for better UX and reliability
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        console.log('[Auth] Google login successful');
        
        // Optimization: Try to fetch profile first to see if user exists
        // This avoids waiting for syncUserToBackend for returning users
        try {
          const profile = await getUserProfile(result.user.uid);
          
          if (profile) {
            // User exists! Navigate immediately
            console.log('[Auth] Returning user detected, navigating...');
            const hasCompletedSetup = profile.setupCompleted || (profile.startingWeight && profile.goalWeight);
            
            // Sync in background to update details if needed (name, photo, etc.)
            syncUserToBackend(result.user).catch(err => console.error('[Auth] Background sync error:', err));
            
            navigate(hasCompletedSetup ? '/' : '/setup');
          } else {
            // Profile not found, likely a new user
            console.log('[Auth] New user detected (no profile), syncing to backend...');
            await syncUserToBackend(result.user);
            
            // For new users, send to setup
            navigate('/setup');
          }
        } catch (error) {
          console.log('[Auth] Error checking profile, falling back to sync...', error);
          // Fallback: Sync and send to setup
          await syncUserToBackend(result.user);
          navigate('/setup');
        }
      }
      
      return result;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
