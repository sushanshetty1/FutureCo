// app/startup/[id]/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  MapPin,
  Clock,
  Building,
  PieChart as PieChartIcon,
  Phone,
  Linkedin,
  Loader2,
  Globe,
  Users,
  Target,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth, db } from '@/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from '@/components/Navbar.jsx';

const countryCodes = [
  { value: "+1", label: "US/CA (+1)" },
  { value: "+44", label: "UK (+44)" },
  { value: "+91", label: "IN (+91)" },
  { value: "+61", label: "AU (+61)" },
  { value: "+33", label: "FR (+33)" },
  { value: "+49", label: "DE (+49)" },
  // Add more as needed
];

const TechBadge = ({ tech }) => (
  <div className="px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 text-sm flex items-center gap-1.5 hover:border-[#a6ff00]/50 hover:bg-[#1a1a1a]/80 transition-all duration-300">
    <Code className="w-3.5 h-3.5 text-[#a6ff00]" />
    {tech}
  </div>
);

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="bg-[#1a1a1a] rounded-xl border border-white/10 p-4 hover:border-[#a6ff00]/30 transition-all duration-300">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-[#2a2a2a]">
        <Icon className="w-5 h-5 text-[#a6ff00]" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{value}</p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  </div>
);

const ApplicationForm = ({ startupId, onClose }) => {
  const [formData, setFormData] = useState({
    countryCode: "+1",
    phone: "",
    linkedin: "",
    experience: "",
    motivation: "",
    githubUsername: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      if (!auth.currentUser || !auth.currentUser.providerData[0]?.providerId === 'github.com') {
        console.error('User must be authenticated with GitHub');
        return;
      }
  
      const applicationsRef = collection(db, 'startupListings', startupId, 'applications');
      const applicationDoc = await addDoc(applicationsRef, {
        userId: auth.currentUser.uid,
        githubProfile: formData.githubUsername,
        fullName: auth.currentUser.displayName,
        phone: `${formData.countryCode}${formData.phone}`,
        linkedin: formData.linkedin,
        experience: formData.experience,
        motivation: formData.motivation,
        submittedAt: new Date(),
        status: 'pending',
      });
  
      const startupRef = doc(db, 'startupListings', startupId);
      const startupDoc = await getDoc(startupRef);
  
      if (startupDoc.exists()) {
        const startupData = startupDoc.data();
        const founderId = startupData.founderId;

        const notificationsRef = collection(db, 'notifications');
        await addDoc(notificationsRef, {
          recipientId: founderId, // Specific founder ID
          founderId: founderId, // Additional field to filter notifications
          type: 'new_application',
          applicantId: auth.currentUser.uid,
          applicationId: applicationDoc.id,
          startupId: startupId,
          applicantName: auth.currentUser.displayName,
          applicantGithub: formData.githubUsername,
          roleTitle: startupData.title,
          message: `${auth.currentUser.displayName} has applied as a technical co-founder for ${startupData.title}`,
          timestamp: new Date(),
          read: false,
          preview: {
            experience: formData.experience.substring(0, 150) + '...',
            linkedin: formData.linkedin,
            techStack: startupData.techStack || [],
            equity: startupData.equity,
          }
        });
      } else {
        console.error('Startup document not found.');
      }
  
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Phone Number</label>
          <div className="flex gap-2">
            <Select 
              value={formData.countryCode}
              onValueChange={(value) => setFormData(prev => ({ ...prev, countryCode: value }))}
            >
              <SelectTrigger className="w-[140px] bg-[#1a1a1a] border-white/10">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {countryCodes.map((code) => (
                  <SelectItem key={code.value} value={code.value}>
                    {code.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              required
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="flex-1 bg-[#1a1a1a] border-white/10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">LinkedIn Profile</label>
          <Input
            required
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin}
            onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
            className="bg-[#1a1a1a] border-white/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">GitHub Username</label>
          <Input
            required
            placeholder="Enter your GitHub username"
            value={formData.githubUsername}
            onChange={(e) => setFormData(prev => ({ ...prev, githubUsername: e.target.value }))}
            className="bg-[#1a1a1a] border-white/10"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Relevant Experience</label>
          <Textarea
            required
            value={formData.experience}
            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
            className="bg-[#1a1a1a] border-white/10 min-h-[120px]"
            placeholder="Tell us about your relevant technical experience, projects, and achievements..."
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Why are you interested?</label>
          <Textarea
            required
            value={formData.motivation}
            onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
            className="bg-[#1a1a1a] border-white/10 min-h-[120px]"
            placeholder="What excites you about this opportunity? How do you see yourself contributing to the startup's success?"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-white/10 text-white hover:bg-white bg-red-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-[#a6ff00] text-black hover:bg-white"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
};

const StartupDetail = ({ params }) => {
  const [startupId, setStartupId] = useState(null);
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const resolvedParams = use(params);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (resolvedParams?.id) {
      setStartupId(resolvedParams.id);
    }
  }, [resolvedParams]);

  useEffect(() => {
    if (!startupId) return;

    const fetchStartup = async () => {
      try {
        const startupRef = doc(db, 'startupListings', startupId);
        const startupDoc = await getDoc(startupRef);

        if (startupDoc.exists()) {
          setStartup({
            id: startupDoc.id,
            ...startupDoc.data(),
          });
        } else {
          setError('Startup not found');
        }
      } catch (err) {
        console.error('Error fetching startup:', err);
        setError('Failed to load startup details');
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [startupId]);

  const isGitHubUser = user && user.providerData[0]?.providerId === 'github.com';

  const handleApplyClick = () => {
    if (!user) {
      alert("Please sign in with GitHub to apply");
      return;
    }
    
    if (!isGitHubUser) {
      alert("Only GitHub users can apply for technical co-founder positions");
      return;
    }

    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#a6ff00] animate-spin mx-auto" />
          <p className="text-white/70">Loading startup details...</p>
        </div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#1f1f1f] border-white/10">
            <CardHeader>
              <CardTitle className="text-3xl text-white">
                {error || 'Startup Not Found'}
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                {error || "The startup you're looking for doesn't exist or has been removed."}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
        <Navbar />

    <div className="min-h-screen bg-black pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{startup.title}</h1>
          <div className="flex items-center gap-4 text-white/50 mb-6">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>{startup.employeeCount} employees</span>
            </div>
            <div className="text-white/30">•</div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{startup.location}</span>
            </div>
            <div className="text-white/30">•</div>
            <div>Founded {startup.foundingDate}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-[#1f1f1f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white">About the Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/70 text-lg leading-relaxed whitespace-pre-line">
                  {startup.description}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1f1f1f] border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white">Technical Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-3">Required Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {startup.techStack?.map((tech, index) => (
                        <TechBadge key={index} tech={tech} />
                      ))}
                    </div>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-[#1f1f1f] border-white/10 sticky top-24">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <InfoCard 
                      icon={DollarSign}
                      label="Equity Offered"
                      value={`${startup.equity}% ownership`}
                    />
                    <InfoCard 
                      icon={Users}
                      label="Team Size"
                      value={`${startup.employeeCount}`}
                    />
                    <InfoCard 
                      icon={Clock}
                      label="Commitment"
                      value={`${startup.workType} · ${startup.commitment}`}
                    />
                  </div>

                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <Button 
                      onClick={handleApplyClick}
                      className={`w-full text-lg py-6 ${
                        isGitHubUser 
                          ? 'bg-[#a6ff00] text-black hover:bg-white' 
                          : 'bg-gray-600 text-white/70 cursor-not-allowed'
                      }`}
                      disabled={!isGitHubUser}
                    >
                      {isGitHubUser 
                        ? 'Apply Now' 
                        : user 
                          ? 'GitHub Login Required' 
                          : 'Sign in with GitHub to Apply'}
                    </Button>
                    
                    <DialogContent className="bg-[#1f1f1f] border-white/10 text-white max-w-xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Apply to {startup.title}</DialogTitle>
                        <DialogDescription className="text-white/70">
                          Submit your application to join as a technical co-founder.
                        </DialogDescription>
                      </DialogHeader>
                      {isGitHubUser && (
                        <ApplicationForm 
                          startupId={startup.id} 
                          onClose={() => setShowForm(false)} 
                        />
                      )}
                    </DialogContent>

                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default StartupDetail;