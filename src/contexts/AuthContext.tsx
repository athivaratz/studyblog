"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { initializeNewUser } from "@/lib/firebaseServices";
import { isInAppBrowser } from "@/lib/utils";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  school?: string;
  studentId?: string;
  createdAt?: Date;
  lastLoginAt?: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  isWebView: boolean;
  signInWithGoogle: () => Promise<UserCredential | null>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [isWebView, setIsWebView] = useState(false);

  // Detect in-app browser on mount
  useEffect(() => {
    setIsWebView(isInAppBrowser());
  }, []);

  // Handle redirect result (for in-app browser fallback)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // Redirect sign-in succeeded, onAuthStateChanged will handle the rest
          console.log("Redirect sign-in successful");
        }
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
      });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch or create user profile
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data() as UserProfile);
          // Update last login
          await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
        } else {
          // Create new user profile
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date(),
            lastLoginAt: new Date(),
          };
          await setDoc(userRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
        setInitialized(false);
      }
      
      // Initialize user data (stats, settings) once after auth
      if (user && !initialized) {
        try {
          await initializeNewUser(user.uid);
          setInitialized(true);
        } catch (err) {
          console.error("Error initializing user:", err);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google (with in-app browser fallback)
  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    try {
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      // If popup is blocked or fails in WebView, try redirect
      if (
        firebaseError.code === "auth/popup-blocked" ||
        firebaseError.code === "auth/popup-closed-by-browser" ||
        firebaseError.code === "auth/cancelled-popup-request" ||
        isWebView
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return null; // Will complete after redirect
        } catch (redirectError) {
          console.error("Redirect sign-in also failed:", redirectError);
          return null;
        }
      }
      console.error("Error signing in with Google:", error);
      return null;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, data, { merge: true });
    setUserProfile((prev) => prev ? { ...prev, ...data } : null);
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    initialized,
    isWebView,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Default values for when context is not available (during static generation)
const defaultAuthContext: AuthContextType = {
  user: null,
  userProfile: null,
  loading: true,
  initialized: false,
  isWebView: false,
  signInWithGoogle: async () => null,
  signOut: async () => {},
  updateProfile: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  // Return default values during static generation instead of throwing
  if (context === undefined) {
    // In development, warn about missing provider
    if (typeof window !== "undefined") {
      console.warn("useAuth must be used within an AuthProvider");
    }
    return defaultAuthContext;
  }
  return context;
}
