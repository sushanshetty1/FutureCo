"use client"
import React, { useState, useEffect } from 'react';
import { auth, db } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, XCircle, Clock, Building2, Users, Calendar, MapPin, Briefcase, Trash2, Mail } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import { Phone, CheckCircle } from 'lucide-react';

const StatusIcon = ({ status }) => {
  const statusConfig = {
    approved: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <div className={`p-2 rounded-full ${config.bg}`}>
      <Icon className={`w-6 h-6 ${config.color}`} />
    </div>
  );
};


const ApplicationRequests = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [founderDetails, setFounderDetails] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteApplication = async (startupId, applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    setDeleteLoading(true);
    try {
      // Delete the application document from the subcollection
      await deleteDoc(doc(db, 'startupListings', startupId, 'applications', applicationId));
      
      // Update the local state to remove the deleted application
      setApplications(prevApplications => 
        prevApplications.filter(app => app.id !== applicationId)
      );
    } catch (err) {
      console.error("Error deleting application:", err);
      alert('Failed to delete application. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchStartupDetails = async (startupId, application) => {
    if (!startupId) {
      console.error("No startup ID provided");
      return;
    }
  
    try {
      const startupDoc = await getDoc(doc(db, 'startupListings', startupId));
      if (startupDoc.exists()) {
        const startupData = {
          id: startupDoc.id,
          ...startupDoc.data()
        };
        setSelectedStartup(startupData);
        setSelectedApplication(application);
        setFounderDetails(null); // Reset founder details

        // Only fetch founder details if application is approved
        if (application.status === "approved") {
          try {
            // Get founder details from the users collection instead
            const founderDoc = await getDoc(doc(db, 'users', startupData.founderId));
            if (founderDoc.exists()) {
              const founderData = founderDoc.data();
              setFounderDetails({
                phone: founderData.phoneNumber || founderData.whatsappNumber || 'Not provided',
                email: founderData.email || 'Not provided'
              });
            } else {
              setFounderDetails({ phone: 'Not available', email: 'Not available' });
            }
          } catch (founderError) {
            console.error("Error fetching founder details:", founderError);
            setFounderDetails({ phone: 'Not available', email: 'Not available' });
          }
        }
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching startup details:", err);
      setError("Failed to load startup details. Please try again later.");
    }
  };

  const ContactSection = ({ application }) => {
    if (!application || application.status !== 'approved') {
      return null;
    }
  
    return (
      <div className="space-y-4 border-t border-white/10 pt-4 mt-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Founder Contact Details
        </h3>
        {founderDetails ? (
          <div className="grid grid-cols-1 gap-4 bg-white/5 p-4 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#a6ff00]" />
                  <span className="text-white/70">Phone Number:</span>
                </div>
                <span className="text-white font-medium">
                  {founderDetails.phone}
                </span>
              </div>
            </div>
            <div className="text-sm text-white/50 mt-2">
              You can now contact the founder directly to discuss next steps.
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/50 italic">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading contact details...
          </div>
        )}
      </div>
    );
  };
  
  const renderTechStack = (techStack) => {
    if (!techStack) return null;
    
    const technologies = Array.isArray(techStack) 
      ? techStack 
      : typeof techStack === 'string' 
        ? techStack.split(',') 
        : [];

    return technologies.map((tech, index) => (
      <Badge 
        key={index} 
        variant="outline" 
        className="bg-white/5"
      >
        {typeof tech === 'string' ? tech.trim() : tech}
      </Badge>
    ));
  };
    
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setError(null);
  
      if (!user) {
        setError("You need to be signed in to view your applications.");
        setLoading(false);
        return;
      }
  
      const provider = user.providerData[0]?.providerId;
      if (provider !== 'github.com' && provider !== 'google.com') {
        setError("You need to be signed in with GitHub or Google to view your applications.");
        setLoading(false);
        return;
      }
  
      try {
        const applicationsRef = collection(db, 'startupListings');
        const userApplications = [];
        const startupSnapshots = await getDocs(applicationsRef);
  
        for (const startupDoc of startupSnapshots.docs) {
          const applicationsSubcollection = collection(
            db,
            'startupListings',
            startupDoc.id,
            'applications'
          );
          const q = query(applicationsSubcollection, where('userId', '==', user.uid));
          const applicationSnapshots = await getDocs(q);
  
          applicationSnapshots.forEach((doc) => {
            userApplications.push({
              id: doc.id,
              startupId: startupDoc.id, // Add the startup document ID
              ...doc.data(),
              startupTitle: startupDoc.data().title,
            });
          });
        }
  
        setApplications(userApplications);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-[#a6ff00] animate-spin mx-auto" />
          </div>
          <p className="text-white/70 text-lg">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#1f1f1f] border-white/10 shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-3xl text-white">Error</CardTitle>
              <CardDescription className="text-white/70 text-lg">
                {error}
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-[#a6ff00] bg-clip-text text-transparent">
              My Applications
            </h1>
            <Badge variant="outline" className="text-[#a6ff00] border-[#a6ff00] px-4 py-2">
              {applications.length} Total
            </Badge>
          </div>

          {applications.length === 0 ? (
            <Card className="bg-[#1f1f1f] border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-white/50 mb-4">
                  <Building2 className="w-16 h-16" />
                </div>
                <p className="text-white/70 text-lg">You haven't submitted any applications yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {applications.map((application) => (
                <Card
                  key={application.id}
                  className="bg-[#1f1f1f] border-white/10 hover:shadow-xl hover:border-[#a6ff00] transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-white group-hover:text-[#a6ff00] transition-colors">
                          {application.startupTitle}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-white/50 text-sm flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(application.submittedAt.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <StatusIcon status={application.status} />
                    </div>
                    
                    <div className="mt-6 flex items-center gap-4">
                      <button
                        onClick={() => fetchStartupDetails(application.startupId, application)}
                        className="text-[#a6ff00] hover:bg-[#a6ff00] hover:text-black border border-[#a6ff00] py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                      >
                        View Details
                      </button>
                      {application.status === 'rejected' && (
                        <button
                          onClick={() => deleteApplication(application.startupId, application.id)}
                          disabled={deleteLoading}
                          className="text-red-500 hover:bg-red-500 hover:text-black border border-red-500 py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                        >
                          {deleteLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </>
                          )}
                        </button>
                      )}
                      <Badge variant="secondary" className={`
                        ${application.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                          application.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                          'bg-yellow-500/10 text-yellow-500'}
                      `}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="bg-[#1f1f1f] border-white/10 text-white max-w-3xl max-h-[85vh] overflow-hidden">
            <DialogHeader className="sticky top-0 z-10 bg-[#1f1f1f] pb-4 border-b border-white/10">
              <DialogTitle className="text-2xl font-bold text-[#a6ff00]">
                {selectedStartup?.title}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Application Status: 
                <Badge className={`ml-2 ${
                  selectedApplication?.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                  selectedApplication?.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 
                  'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {selectedApplication?.status?.charAt(0).toUpperCase() + selectedApplication?.status?.slice(1)}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[calc(85vh-120px)] pr-4 -mr-4">
              {selectedStartup && (
                <div className="space-y-6 p-2">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">About</h3>
                    <p className="text-white/70">{selectedStartup.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </div>
                      <p className="text-white">{selectedStartup.location || 'Not specified'}</p>
                    </div>

                    <div className="space-y-1 bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className="w-4 h-4" />
                        <span>Team Size</span>
                      </div>
                      <p className="text-white">{selectedStartup.employeeCount ? `${selectedStartup.employeeCount} employees` : 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedStartup.techStack && selectedStartup.techStack.map((tech, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-white/5 text-white"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-white/70">
                        <Briefcase className="w-4 h-4" />
                        <span>Work Type</span>
                      </div>
                      <p className="text-white capitalize">{selectedStartup.workType || 'Not specified'}</p>
                    </div>

                    <div className="space-y-1 bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock className="w-4 h-4" />
                        <span>Commitment</span>
                      </div>
                      <p className="text-white capitalize">{selectedStartup.commitment || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Requirements</h3>
                    <p className="text-white/70">{selectedStartup.requirements || 'No specific requirements listed'}</p>
                  </div>

                  <div className="space-y-2 bg-white/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white">Equity Offered</h3>
                    <p className="text-white/70">{selectedStartup.equity || 'Not specified'}</p>
                  </div>

                  {selectedApplication?.status === 'approved' && founderDetails && (
                    <div className="space-y-4 bg-white/5 p-4 rounded-lg border-t border-white/10">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Founder Contact Details
                      </h3>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#a6ff00]" />
                            <span className="text-white/70">Phone Number:</span>
                          </div>
                          <span className="text-white font-medium">
                            {selectedStartup.whatsappNumber}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#a6ff00]" />
                            <span className="text-white/70">Email:</span>
                          </div>
                          <span className="text-white font-medium">
                            {selectedStartup.founderEmail}
                          </span>
                        </div>
                        <div className="text-sm text-white/50 mt-2 p-3 bg-white/5 rounded-lg">
                          You can now contact the founder directly to discuss next steps.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

export default ApplicationRequests;