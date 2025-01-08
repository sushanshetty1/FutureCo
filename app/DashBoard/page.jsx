"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Briefcase,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Phone,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Navbar from "@/components/NavBar";
import Category from '@/components/Category';


const FounderDashboard = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [isNewListingOpen, setIsNewListingOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formError, setFormError] = useState("");
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    equity: "",
    location: "",
    techStack: "",
    requirements: "",
    workType: "remote",
    commitment: "full-time",
    foundingDate: "",
    employeeCount: "",
    whatsappNumber: "",
    countryCode: "+1",
    categories: [],
  });

  const validateWhatsAppNumber = (number) => {
    return /^\d{10}$/.test(number);
  };


  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let unsubscribe;
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, "startupListings");
        const listingsQuery = query(
          listingsRef,
          where("founderId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        unsubscribe = onSnapshot(listingsQuery, async (snapshot) => {
          const listingsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setListings(listingsData);

          const applicationsRef = collection(db, "applications");
          const applicationsQuery = query(
            applicationsRef,
            where("founderId", "==", user.uid)
          );
          const applicationsSnap = await getDocs(applicationsQuery);
          setTotalApplications(applicationsSnap.size);
          
          // Only set loading to false after everything is loaded
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error setting up listeners:", error);
        setIsLoading(false);
      }
    };

    fetchListings();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);


  const handleNewListing = async (e) => {
    e.preventDefault();
    if (!user || !acceptedTerms) {
      setFormError("Please accept the terms and conditions to continue.");
      return;
    }

    if (newListing.categories.length === 0) {
      setFormError("Please select at least one category");
      return;
    }

    const equityValue = parseInt(newListing.equity);
    if (isNaN(equityValue) || equityValue < 0 || equityValue > 100) {
      setFormError("Equity must be a valid percentage between 0 and 100");
      return;
    }

    if (!validateWhatsAppNumber(newListing.whatsappNumber)) {
      setFormError("Please enter a valid 10-digit WhatsApp number");
      return;
    }

    try {
      await addDoc(collection(db, "startupListings"), {
        ...newListing,
        equity: equityValue,
        founderId: user.uid,
        founderName: user.displayName,
        founderEmail: user.email,
        createdAt: serverTimestamp(),
        techStack: newListing.techStack.split(",").map((tech) => tech.trim()),
        whatsappNumber: `${newListing.countryCode}${newListing.whatsappNumber}`,
        categories: newListing.categories,
        applicants: 0,
        status: "active",
      });

      setIsNewListingOpen(false);
      setNewListing({
        title: "",
        description: "",
        equity: "",
        location: "",
        techStack: "",
        requirements: "",
        workType: "remote",
        commitment: "full-time",
        foundingDate: "",
        employeeCount: "",
        whatsappNumber: "",
        countryCode: "+1",
        categories: [],
      });
      setAcceptedTerms(false);
      setFormError("");
    } catch (error) {
      console.error("Error creating listing:", error);
      setFormError(
        "An error occurred while creating the listing. Please try again."
      );
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-black pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Founder Dashboard</h1>
            <p className="text-white/70 mt-2 text-lg">Manage your startup listings and track applications</p>
          </div>
          <Dialog open={isNewListingOpen} onOpenChange={setIsNewListingOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#a6ff00] text-black hover:bg-white px-6 h-12 text-base w-full sm:w-auto">
                <Plus className="w-5 h-5 mr-2" />
                Create New Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleNewListing} className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="text-white text-2xl">Create New Startup Listing</DialogTitle>
                  <DialogDescription className="text-white/70 text-base">
                    Share your startup's vision and find the perfect tech co-founder.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-8">
                  {/* Form sections remain the same but with better spacing */}
                  <div className="space-y-4">
                    <h3 className="text-lg text-white">Basic Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white text-base">Startup Title</Label>
                        <Input
                          className="bg-[#1f1f1f] border-white/10 text-white h-12 px-4 mt-2"
                          placeholder="Enter your startup name"
                          value={newListing.title}
                          onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-base">Description</Label>
                        <Textarea
                          className="bg-[#1f1f1f] border-white/10 text-white min-h-[120px] px-4 py-2 mt-2"
                          placeholder="Describe your startup's mission and vision"
                          value={newListing.description}
                          onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg text-white">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-base">Equity Percentage</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          className="bg-[#1f1f1f] border-white/10 text-white h-12 px-4 mt-2"
                          placeholder="e.g. 15"
                          value={newListing.equity}
                          onChange={(e) => setNewListing(prev => ({ ...prev, equity: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-base">Location</Label>
                        <Input
                          className="bg-[#1f1f1f] border-white/10 text-white h-12 px-4 mt-2"
                          placeholder="e.g. San Francisco"
                          value={newListing.location}
                          onChange={(e) => setNewListing(prev => ({ ...prev, location: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-base">Work Type</Label>
                        <select
                          className="w-full bg-[#1f1f1f] border border-white/10 text-white h-12 px-3 rounded-md mt-2"
                          value={newListing.workType}
                          onChange={(e) => setNewListing(prev => ({ ...prev, workType: e.target.value }))}
                        >
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Onsite">On-site</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-white text-base">Commitment</Label>
                        <select
                          className="w-full bg-[#1f1f1f] border border-white/10 text-white h-12 px-3 rounded-md mt-2"
                          value={newListing.commitment}
                          onChange={(e) => setNewListing(prev => ({ ...prev, commitment: e.target.value }))}
                        >
                          <option value="Full-Time">Full-time</option>
                          <option value="Part-Time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg text-white">Company Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-base">Founding Date</Label>
                        <Input
                          type="date"
                          className="bg-[#1f1f1f] border-white/10 text-white h-12 px-4 mt-2"
                          value={newListing.foundingDate}
                          onChange={(e) =>
                            setNewListing((prev) => ({
                              ...prev,
                              foundingDate: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white text-base">Number of Employees</Label>
                        <select
                          className="w-full bg-[#1f1f1f] border border-white/10 text-white h-12 px-3 rounded-md mt-2"
                          value={newListing.employeeCount}
                          onChange={(e) =>
                            setNewListing((prev) => ({
                              ...prev,
                              employeeCount: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="">Select employee count</option>
                          <option value="1-5">1-5 employees</option>
                          <option value="6-10">6-10 employees</option>
                          <option value="11-25">11-25 employees</option>
                          <option value="26-50">26-50 employees</option>
                          <option value="50+">50+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-white text-base">Business WhatsApp</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-white/40 hover:text-white/60 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#1f1f1f] border-white/10 text-white p-3">
                              <p>Contact details will only be shared with approved applicants</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="bg-[#1f1f1f] border border-white/10 text-white h-12 px-3 rounded-md"
                          value={newListing.countryCode}
                          onChange={(e) =>
                            setNewListing((prev) => ({
                              ...prev,
                              countryCode: e.target.value,
                            }))
                          }
                          required
                        >
                          <option value="+1">+1 (US)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+81">+81 (JP)</option>
                          <option value="+86">+86 (CN)</option>
                          <option value="+49">+49 (DE)</option>
                          {/* Add more country codes as needed */}
                        </select>
                        <Input
                          type="tel"
                          className="bg-[#1f1f1f] border-white/10 text-white h-12 px-4 flex-1"
                          placeholder="WhatsApp number (10 digits)"
                          value={newListing.whatsappNumber}
                          onChange={(e) =>
                            setNewListing((prev) => ({
                              ...prev,
                              whatsappNumber: e.target.value,
                            }))
                          }
                          pattern="\d{10}"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                  <h3 className="text-lg text-white">Categories</h3>
                  <Category
                    selectedCategories={newListing.categories}
                    setSelectedCategories={(categories) => 
                      setNewListing(prev => ({ ...prev, categories }))
                    }
                  />
                </div>
                  <div>
                    <h3 className="text-lg text-white mb-4">Tech Stack</h3>
                    <Label className="text-white text-base">Required Tech Stack</Label>
                    <Input
                      className="bg-[#1f1f1f] border-white/10 text-white h-12 px-4 mt-2"
                      placeholder="e.g. React, Node.js, AWS (comma separated)"
                      value={newListing.techStack}
                      onChange={(e) => setNewListing(prev => ({ ...prev, techStack: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={setAcceptedTerms}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="terms"
                        className="text-sm text-white/70 leading-relaxed"
                      >
                        I agree to the terms and conditions, including the fair use policy and commitment to responding to applicants within 7 business days. I understand that failure to comply may result in listing removal.
                      </label>
                    </div>
                  </div>

                  {formError && (
                    <Alert variant="destructive" className="bg-red-900/20 border-red-900">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-[#a6ff00] text-black hover:bg-white h-12 px-8 w-full sm:w-auto">
                    Create Listing
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="mt-8">
          <Card className="bg-[#1f1f1f] border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#a6ff00]/10">
                    <Users className="w-6 h-6 text-[#a6ff00]" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{totalApplications}</p>
                    <p className="text-white/70">Total Applications</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 rounded-full bg-white/5">
                    <p className="text-white/70">Active Listings: {listings.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Listings */}
        <div className="mt-12 mb-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Your Listings</h2>
          <div className="grid grid-cols-1 gap-6">
          {listings.map(listing => (
              <StartupListing
                key={listing.id}
                {...listing}
                onViewApplications={() => router.push(`/applications/${listing.id}`)}
              />
            ))}
            {listings.length === 0 && (
              <div className="text-center py-16 bg-[#1f1f1f] rounded-lg border border-white/10">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-white/5">
                    <Plus className="w-8 h-8 text-white/40" />
                  </div>
                  <div>
                    <p className="text-white/70 text-lg">No active listings</p>
                    <p className="text-white/40 mt-1">Create your first listing to start finding co-founders</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

const StartupListing = ({ 
  id, 
  title, 
  description, 
  equity, 
  location, 
  applicants, 
  techStack, 
  workType, 
  commitment, 
  categories,
  onViewApplications 
}) => (
  <Card className="bg-[#1f1f1f] border-white/10 hover:border-[#a6ff00]/50 transition-all duration-300">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-xl text-white">{title}</CardTitle>
          <CardDescription className="text-white/70 mt-2 text-base leading-relaxed">
            {description}
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          className="text-[#a6ff00] hover:text-white hover:bg-white/10"
          onClick={onViewApplications}
        >
          View Applications
          <ArrowUpRight className="w-4 h-4 ml-2" />
        </Button>
        </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center text-white/70">
            <Briefcase className="w-4 h-4 mr-2" />
            {equity} equity
          </div>
          <div className="flex items-center text-white/70">
            <Users className="w-4 h-4 mr-2" />
            {applicants || 0} applications
          </div>
          <div className="px-3 py-1 rounded-full bg-[#a6ff00]/10 text-[#a6ff00] text-sm">
            {workType}
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-sm">
            {commitment}
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 text-white/70 text-sm">
            {location}
          </div>
        </div>
        {categories && categories.length > 0 && (
            <div>
              <p className="text-sm text-white/40 mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
        <div>
          <p className="text-sm text-white/40 mb-2">Required Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(techStack) ? techStack.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 text-sm"
              >
                {tech}
              </span>
            )) : null}
          </div>
        </div>
        {applicants > 0 && (
          <div className="pt-4 mt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#a6ff00]" />
                <span className="text-white/70 text-sm">
                  {applicants} {applicants === 1 ? 'developer has' : 'developers have'} applied
                </span>
              </div>
              <Alert className="bg-[#1a1a1a] border-[#a6ff00]/20 py-2 px-4">
                <AlertDescription className="text-[#a6ff00] text-xs">
                  New applications to review
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default FounderDashboard;