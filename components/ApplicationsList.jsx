import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Briefcase, Calendar, Github, Globe, Mail, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from 'next/link';


const ApplicationsList = ({ applications, onApprove, onReject }) => {
  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No applications yet</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        if (!application) return null;
        
        const {
          id,
          applicantName,
          applicantEmail,
          githubProfile,
          portfolioUrl,
          experience,
          location,
          coverLetter,
          createdAt,
          status,
          applicantId
        } = application;

        const isReviewed = status === 'approved' || status === 'rejected';

        return (
          <Card key={id} className="bg-[#1f1f1f] border-white/10">
            <CardContent className="p-6">
              {/* Header with applicant info */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {applicantName}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {applicantEmail && (
                      <div className="flex items-center text-white/70 text-sm">
                        <Mail className="w-4 h-4 mr-1.5" />
                        {applicantEmail}
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        {location}
                      </div>
                    )}
                    {createdAt && (
                      <div className="flex items-center text-white/70 text-sm">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Applied {formatDate(createdAt)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                {githubProfile && (
                  <Link href={`/GitHubProfile/${githubProfile}`} passHref>
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </Link>
                )}
                  {portfolioUrl && (
                    <Button
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                      onClick={() => window.open(portfolioUrl, '_blank')}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                    </Button>
                  )}
                </div>
              </div>

              {/* Experience */}
              {experience && (
                <div className="mb-6">
                  <h4 className="text-white/40 text-sm mb-2">Experience</h4>
                  <div className="flex items-center text-white">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {experience} years
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {coverLetter && (
                <div className="mb-6">
                  <h4 className="text-white/40 text-sm mb-2">Cover Letter</h4>
                  <p className="text-white/90 whitespace-pre-wrap">{coverLetter}</p>
                </div>
              )}

              {/* Application Status */}
              {status && (
                <div className="mb-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    status === 'approved' 
                      ? 'bg-green-500/10 text-green-500'
                      : status === 'rejected'
                      ? 'bg-red-500/10 text-red-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </div>
                </div>
              )}

              {/* Warning for missing required info */}
              {(!applicantEmail || !githubProfile) && (
                <Alert className="mb-6 bg-yellow-500/10 border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-500">
                    Some required information is missing from this application
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              {!isReviewed && (
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    className="border-white/10 text-white hover:bg-white/10"
                    onClick={() => onReject(application)}
                  >
                    Reject
                  </Button>
                  <Button
                    className="bg-[#a6ff00] text-black hover:bg-white"
                    onClick={() => onApprove(application)}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ApplicationsList;