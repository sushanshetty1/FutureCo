"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  Code, 
  ArrowRight, 
  Users, 
  Briefcase, 
  AlertCircle, 
  Loader2,
  MapPin,
  Clock,
  ChevronRight,
  PieChart as PieChartIcon,
  Plus
} from 'lucide-react';
import { auth, googleProvider, githubProvider, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { 
  signInWithPopup, 
  fetchSignInMethodsForEmail,
  linkWithPopup,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StartupListing from './StartupListing';

const Hero = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const listingsRef = collection(db, "startupListings");
        const listingsQuery = query(
          listingsRef,
          where("listing", "!=", "success"),
          orderBy("listing"),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        
        const snapshot = await getDocs(listingsQuery);
        const listingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setListings(listingsData);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Unable to load listings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchListings();
    }
  }, [user]);

  // Rest of the component remains the same...
  
  const handleAuth = async (provider) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      const userDocRef = doc(db, "users", user.uid);
  
      const userSnapshot = await getDoc(userDocRef);
  
      if (!userSnapshot.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          displayName: user.displayName || "Anonymous",
          email: user.email,
          photoURL: user.photoURL || "",
          provider: provider === googleProvider ? "Google" : "GitHub",
          createdAt: serverTimestamp(),
        });
        console.log("New user added to Firestore:", user.uid);
      } else {
        console.log("User already exists in Firestore:", user.uid);
      }
  
      router.push("/");
    } catch (error) {
      console.error("Auth error:", error);
  
      if (error.code === "auth/account-exists-with-different-credential") {
        const email = error.customData.email;
        const methods = await fetchSignInMethodsForEmail(auth, email);
  
        if (methods[0] === "google.com") {
          setError({
            title: "Account Exists",
            description: "Please sign in with Google first, then link your GitHub account.",
            action: "Sign in with Google",
            provider: googleProvider,
          });
        } else if (methods[0] === "github.com") {
          setError({
            title: "Account Exists",
            description: "Please sign in with GitHub first, then link your Google account.",
            action: "Sign in with GitHub",
            provider: githubProvider,
          });
        }
      } else {
        setError({
          title: "Authentication Error",
          description: "An error occurred during sign-in. Please try again.",
          action: null,
        });
      }
    }
  };

  const handleAccountLinking = async (existingProvider) => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, existingProvider);
      const newProvider = existingProvider === googleProvider ? githubProvider : googleProvider;
      await linkWithPopup(result.user, newProvider);
      
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (linkError) {
      console.error('Account linking error:', linkError);
      setError({
        title: "Linking Error",
        description: "Failed to link accounts. Please try again.",
        action: null
      });
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#a6ff00] animate-spin mx-auto" />
          <p className="text-white/70">Loading amazing opportunities...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user.providerData[0].providerId === 'google.com' && (
            <div className="absolute top-24 right-40">
              <Button
                className="bg-[#a6ff00] text-black hover:bg-white"
                onClick={() => router.push('/DashBoard')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </div>
          )}
          
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Featured Startups</h1>
            <p className="text-white/70 text-lg mb-8">
              Explore exciting opportunities to join innovative startups as a technical co-founder
            </p>
            
            {error && (
              <Alert className="mb-6 bg-red-900/20 border-red-900">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-500">Error</AlertTitle>
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-[#a6ff00] animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {listings.map(listing => (
                <StartupListing key={listing.id} {...listing} />
              ))}
              {listings.length === 0 && !error && (
                <div className="text-center py-16 bg-[#1f1f1f] rounded-lg border border-white/10">
                  <p className="text-white/70">No startup listings available at the moment.</p>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black pt-20 mt-10">
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className="bg-yellow-900/20 border-yellow-900">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-500">{error.title}</AlertTitle>
            <AlertDescription className="text-yellow-400">
              {error.description}
              {error.action && (
                <Button
                  variant="link"
                  className="text-[#a6ff00] pl-1 hover:text-[#a6ff00]/80"
                  onClick={() => handleAccountLinking(error.provider)}
                >
                  {error.action}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div 
        className="absolute inset-0 bg-gradient-to-b from-[#a6ff00]/5 to-transparent opacity-50"
        style={{
          maskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 0%, black 100%)'
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            <span className="text-white">Connect.</span>{' '}
            <span className="text-white">Create.</span>{' '}
            <span className="text-[#a6ff00] animate-pulse">Innovate.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/70">
            Join the future of startup building. Connect with visionary founders 
            and exceptional tech talent.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <Button 
              className="group bg-[#a6ff00] text-black hover:bg-white text-lg px-8 py-6 relative overflow-hidden transition-all duration-300 hover:pr-12"
              onClick={() => handleAuth(googleProvider)}
              disabled={!!error}
            >
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                <span>I'm a Founder</span>
                <ArrowRight className="absolute right-4 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="group border-black text-black hover:bg-[#a6ff00] text-lg px-8 py-6 relative overflow-hidden transition-all duration-300 hover:pr-12"
              onClick={() => handleAuth(githubProvider)}
              disabled={!!error}
            >
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                <span>I'm a Tech Professional</span>
                <ArrowRight className="absolute right-4 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;