"use client";
import React, { useState, useEffect } from "react";
import {
  Code2, Star, GitFork, ArrowUpRight, Loader2,
  Calendar, GithubIcon, Globe, BookOpen,
  AlertCircle
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { auth, db } from "../../firebase";
import {
  collection, addDoc, query, where, getDocs,
  onSnapshot, serverTimestamp, orderBy,
  doc, updateDoc
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { onAuthStateChanged } from 'firebase/auth';
import Nav from "@/components/Nav";

const DeveloperDashboard = () => {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [githubData, setGithubData] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const NEXT_PUBLIC_GITHUB_TOKEN="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"
  const [profile, setProfile] = useState({
    bio: "",
    experience: "",
    preferredRoles: [],
    portfolioUrl: "",
    githubUrl: "",
    availability: "full-time",
    preferredWorkType: "remote",
    techStack: ""
  });

  // Track mounted state to prevent memory leaks
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setAuthChecked(true);
        if (!user && !loading) {
          router.push("/login");
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [loading, router, isMounted]);

  // Fetch GitHub data and profile information
  useEffect(() => {
    if (!user || !authChecked) return;

    let unsubscribeFromApplications = null;

    const fetchGithubData = async () => {
      try {
        const githubUser = user.providerData.find(
          (provider) => provider.providerId === 'github.com'
        );
        
        if (!githubUser) {
          console.error("No GitHub provider found");
          if (isMounted) setIsLoading(false);
          return;
        }

        const githubUsername = githubUser.displayName || githubUser.email?.split('@')[0];
        if (!githubUsername) {
          throw new Error('Could not determine GitHub username');
        }

        const headers = {};
        if (NEXT_PUBLIC_GITHUB_TOKEN) {
          headers.Authorization = `token ${NEXT_PUBLIC_GITHUB_TOKEN}`;
        }

        const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`, { headers });
        if (!userResponse.ok) {
          throw new Error(`GitHub API Error: ${await userResponse.text()}`);
        }
        const userData = await userResponse.json();

        // Fetch repositories with the same headers
        const reposResponse = await fetch(
          `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`,
          { headers }
        );
        if (!reposResponse.ok) {
          throw new Error(`GitHub Repos API Error: ${await reposResponse.text()}`);
        }
        const reposData = await reposResponse.json();

        // Process repository data
        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const languages = reposData.map(repo => repo.language).filter(Boolean);
        const topLanguages = [...new Set(languages)].slice(0, 5);

        if (isMounted) {
          setGithubData({
            repos: userData.public_repos,
            stars: totalStars,
            followers: userData.followers,
            contributions: userData.public_contributions || "N/A",
            topLanguages,
            recentRepos: reposData.slice(0, 3).map(repo => ({
              name: repo.name,
              description: repo.description || "No description available",
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              language: repo.language,
              url: repo.html_url
            }))
          });
        }

        // Fetch developer profile
        try {
          const profileRef = collection(db, "developerProfiles");
          const profileQuery = query(profileRef, where("userId", "==", user.uid));
          const profileDocs = await getDocs(profileQuery);
          
          if (!profileDocs.empty && isMounted) {
            const profileData = profileDocs.docs[0].data();
            setProfile({
              bio: profileData.bio || "",
              experience: profileData.experience || "",
              preferredRoles: profileData.preferredRoles || [],
              portfolioUrl: profileData.portfolioUrl || "",
              githubUrl: profileData.githubUrl || `https://github.com/${githubUsername}`,
              availability: profileData.availability || "full-time",
              preferredWorkType: profileData.preferredWorkType || "remote",
              techStack: Array.isArray(profileData.techStack) 
                ? profileData.techStack.join(", ") 
                : profileData.techStack || ""
            });
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        // Set up applications listener
        const applicationsRef = collection(db, "applications");
        const applicationsQuery = query(
          applicationsRef,
          where("developerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        unsubscribeFromApplications = onSnapshot(applicationsQuery, (snapshot) => {
          if (isMounted) {
            const applicationsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              appliedDate: doc.data().createdAt?.toDate() || new Date()
            }));
            setApplications(applicationsData);
            setIsLoading(false);
          }
        });

      } catch (error) {
        console.error("Error in data fetching:", error);
        if (isMounted) {
          setGithubData({
            repos: 0,
            stars: 0,
            followers: 0,
            contributions: "N/A",
            topLanguages: [],
            recentRepos: []
          });
          setIsLoading(false);
        }
      }
    };

    fetchGithubData();

    return () => {
      if (unsubscribeFromApplications) {
        unsubscribeFromApplications();
      }
    };
  }, [user, authChecked, isMounted]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) {
      setFormError("You must be logged in to update your profile.");
      return;
    }

    setIsUpdatingProfile(true);
    setFormError("");

    try {
      const profileRef = collection(db, "developerProfiles");
      const profileQuery = query(profileRef, where("userId", "==", user.uid));
      const profileDocs = await getDocs(profileQuery);

      const profileData = {
        ...profile,
        userId: user.uid,
        githubUsername: user.providerData.find(p => p.providerId === 'github.com')?.displayName,
        email: user.email,
        updatedAt: serverTimestamp(),
        techStack: profile.techStack.split(",").map(tech => tech.trim()).filter(Boolean)
      };

      if (profileDocs.empty) {
        await addDoc(profileRef, {
          ...profileData,
          createdAt: serverTimestamp()
        });
      } else {
        const docRef = doc(db, "developerProfiles", profileDocs.docs[0].id);
        await updateDoc(docRef, profileData);
      }

      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormError("Failed to update profile. Please try again.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (loading || !authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#a6ff00] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-16 h-16 rounded-full border-2 border-[#a6ff00]"
              />
              <div>
                <h1 className="text-4xl font-bold text-white">{user.displayName}</h1>
                <p className="text-white/70 mt-1">{user.email}</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsProfileOpen(true)}
              className="bg-[#a6ff00] text-black hover:bg-white px-6 h-12 text-base"
            >
              Update Profile
            </Button>
          </div>

          {/* GitHub Stats */}
          {githubData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-[#1f1f1f] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#a6ff00]/10">
                      <Code2 className="w-6 h-6 text-[#a6ff00]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{githubData.repos}</p>
                      <p className="text-white/70">Repositories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1f1f1f] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#a6ff00]/10">
                      <Star className="w-6 h-6 text-[#a6ff00]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{githubData.stars}</p>
                      <p className="text-white/70">Total Stars</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1f1f1f] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#a6ff00]/10">
                      <GithubIcon className="w-6 h-6 text-[#a6ff00]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{githubData.followers}</p>
                      <p className="text-white/70">Followers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1f1f1f] border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#a6ff00]/10">
                      <GitFork className="w-6 h-6 text-[#a6ff00]" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">{githubData.repos}</p>
                      <p className="text-white/70">Public Repos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Repositories */}
          {githubData?.recentRepos && (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Recent Repositories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {githubData.recentRepos.map((repo, index) => (
                  <Card key={index} className="bg-[#1f1f1f] border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">{repo.name}</CardTitle>
                      <CardDescription className="text-white/70">
                        {repo.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-white/70">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {repo.stars}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-4 h-4" />
                          {repo.forks}
                        </div>
                        {repo.language && (
                          <div className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded-full bg-[#a6ff00]"></span>
                            {repo.language}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Profile Dialog */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogContent className="bg-black border border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Update Profile</DialogTitle>
                <DialogDescription className="text-white/70">
                  Update your developer profile information
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label className="text-white">Bio</Label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="bg-[#1f1f1f] border-white/10 text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <Label className="text-white">Tech Stack</Label>
                  <Input
                    value={profile.techStack}
                    onChange={(e) => setProfile({ ...profile, techStack: e.target.value })}
                    className="bg-[#1f1f1f] border-white/10 text-white"
                    placeholder="React, Node.js, Python..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Availability</Label>
                    <select
                      value={profile.availability}
                      onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
                      className="w-full bg-[#1f1f1f] border-white/10 text-white mt-2 h-10 rounded-md"
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-white">Work Type</Label>
                    <select
                      value={profile.preferredWorkType}
                      onChange={(e) => setProfile({ ...profile, preferredWorkType: e.target.value })}
                      className="w-full bg-[#1f1f1f] border-white/10 text-white mt-2 h-10 rounded-md"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>

                {formError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-900">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter>
                  <Button type="submit" className="bg-[#a6ff00] text-black hover:bg-white">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Applications Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-white mb-6">Your Applications</h2>
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard key={application.id} {...application} />
              ))}
              {applications.length === 0 && (
                <Card className="bg-[#1f1f1f] border-white/10">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/70 text-lg">No applications yet</p>
                    <p className="text-white/40">Start applying to find your next opportunity</p>
                  </CardContent>
                </Card>
              )}
        </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Application Card Component
const ApplicationCard = ({ startupName, role, status, appliedDate, description }) => {
  const getStatusStyles = (status) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-500",
      accepted: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
      interviewing: "bg-blue-500/10 text-blue-500"
    };
    return styles[status] || styles.pending;
  };

  return (
    <Card className="bg-[#1f1f1f] border-white/10 hover:border-[#a6ff00]/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl text-white">{startupName}</CardTitle>
            <CardDescription className="text-white/70 mt-1">
              {role}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full ${getStatusStyles(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-white/70">{description}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center text-white/40">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(appliedDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <Button 
              variant="ghost" 
              className="text-[#a6ff00] hover:text-white hover:bg-white/10"
              onClick={() => window.open(`/startup/${startupName.toLowerCase().replace(/\s+/g, '-')}`, '_blank')}
            >
              View Startup
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperDashboard;