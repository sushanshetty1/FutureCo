import React from 'react';
import { Button } from "@/components/ui/button";
import { Rocket, Code, ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-screen bg-black pt-20 mt-10">
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
            >
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                <span>I'm a Founder</span>
                <ArrowRight className="absolute right-4 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="group border-2 border-black text-black hover:bg-[#a6ff00]/90 text-lg px-8 py-6 relative overflow-hidden transition-all duration-300 hover:pr-12"
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