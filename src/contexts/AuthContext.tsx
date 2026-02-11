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
import { 
  isInAppBrowser, 
  isMobileDevice, 
  isSupportedMobileBrowser 
} from "@/lib/utils";

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
  isMobile: boolean;
  isSupportedBrowser: boolean;
  isRedirecting: boolean;
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
  const [isMobile, setIsMobile] = useState(false);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [processingRedirect, setProcessingRedirect] = useState(true); // Track if we're processing a redirect

  // Detect browser environment on mount
  useEffect(() => {
    const mobile = isMobileDevice();
    setIsWebView(isInAppBrowser());
    setIsMobile(mobile);
    setIsSupportedBrowser(isSupportedMobileBrowser() || !mobile);
  }, []);

  // Handle redirect result (for in-app browser fallback)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // Redirect sign-in succeeded, onAuthStateChanged will handle the rest
          console.log("Redirect sign-in successful, user:", result.user.email);
          setIsRedirecting(false);
        }
        // Mark that we've finished checking for redirect
        setProcessingRedirect(false);
      })
      .catch((error) => {
        console.error("Redirect sign-in error:", error);
        setIsRedirecting(false);
        setProcessingRedirect(false);
      });
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed, user:", user?.email || "null");
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
    });

    return () => unsubscribe();
  }, []);

  // Set loading to false only after redirect processing is complete
  useEffect(() => {
    if (!processingRedirect) {
      console.log("Redirect processing complete, setting loading to false");
      setLoading(false);
    }
  }, [processingRedirect]);

  // Sign in with Google (use redirect on mobile, popup on desktop)
  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    console.log("signInWithGoogle called:", { isMobile, isWebView, isSupportedBrowser });
    
    try {
      // On mobile devices or in-app browsers, use redirect directly
      if (isMobile || isWebView) {
        console.log("Using redirect flow for mobile/webview");
        setIsRedirecting(true);
        await signInWithRedirect(auth, googleProvider);
        console.log("signInWithRedirect called successfully");
        // Don't reset isRedirecting here - it will reset on page reload
        return null; // Will complete after redirect
      }
      
      // On desktop, try popup first
      console.log("Using popup flow for desktop");
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error("Sign-in error:", firebaseError);
      setIsRedirecting(false);
      
      // If popup is blocked or fails, fallback to redirect
      if (
        firebaseError.code === "auth/popup-blocked" ||
        firebaseError.code === "auth/popup-closed-by-browser" ||
        firebaseError.code === "auth/cancelled-popup-request"
      ) {
        try {
          console.log("Popup failed, trying redirect");
          setIsRedirecting(true);
          await signInWithRedirect(auth, googleProvider);
          // Don't reset isRedirecting here - it will reset on page reload
          return null; // Will complete after redirect
        } catch (redirectError) {
          console.error("Redirect also failed:", redirectError);
          setIsRedirecting(false);
          return null;
        }
      }
      
      // Re-throw the error so it can be caught in the UI
      throw error;
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
    isMobile,
    isSupportedBrowser,
    isRedirecting,
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
  isMobile: false,
  isSupportedBrowser: true,
  isRedirecting: false,
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
