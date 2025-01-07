"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from './Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 z-50" role="navigation" aria-label="Main Navigation">
      <div className="w-full bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-1 flex justify-start">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Logo />
              </Link>
            </div>
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center space-x-16">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/browse">Browse</NavLink>
                <NavLink href="/profile">Profile</NavLink>
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="bg-[#1f1f1f] border-1 px-6 py-6 border-gray-400 rounded-full text-white hover:text-gray-600 transition-all duration-300"
                >
                  Login
                </Button>
              </Link>
            </div>

            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden text-white p-0 hover:bg-transparent hover:text-[#a6ff00]">
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-full bg-black border-white/10"
              >
                <div className="flex flex-col h-full py-8 space-y-8">
                  <div className="flex flex-col space-y-6">
                    <MobileNavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink href="/browse" onClick={() => setIsMenuOpen(false)}>
                      Browse
                    </MobileNavLink>
                    <MobileNavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
                      Profile
                    </MobileNavLink>
                  </div>
                  
                  <div className="mt-auto">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="outline" 
                        className="w-full bg-black text-white hover:text-[#a6ff00] border-white/20 hover:border-[#a6ff00]"
                      >
                        Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }) => (
  <Link
    href={href}
    className="text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className="text-white/70 text-2xl font-medium hover:text-white transition-colors duration-300"
  >
    {children}
  </Link>
);

export default Navbar;