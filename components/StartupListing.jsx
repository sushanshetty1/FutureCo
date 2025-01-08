import React from 'react';
import { Button } from "@/components/ui/button";
import { Building, MapPin, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';

const StartupListing = ({ id, title, description, equity, location, employeeCount}) => {
  const router = useRouter();
  
  const handleViewDetails = () => {
    router.push(`/Startups/${id}`);
  };

  return (
    <Card className="bg-[#1f1f1f] border-white/10 hover:border-[#a6ff00]/50 transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl text-white mb-3">{title}</CardTitle>
            <div className="flex items-center gap-4 mb-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                <span>{employeeCount} employees</span>
              </div>
              <div className="text-white/30">•</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            </div>
            <CardDescription className="text-white/70 line-clamp-2">
              {description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-2 rounded-lg">
            <PieChartIcon className="w-4 h-4 text-[#a6ff00]" />
            <span className="text-white font-medium">{equity}%</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Button 
          onClick={handleViewDetails}
          className="w-full bg-[#a6ff00] text-black hover:bg-white transition-all duration-300"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default StartupListing;