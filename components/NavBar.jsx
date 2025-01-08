"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Bell, MessageSquare, User, LogOut, LayoutDashboard, Search, FolderGit2, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from './Logo';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import photo from '../public/profile.png';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const photoURL = user?.photoURL || {photo};
  const isGitHubUser = user?.providerData?.[0]?.providerId === 'github.com';
  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  const handleNotifications = () => {
    router.push('/Notification');
  };

  if (!user) {
    return (
      <nav className="fixed w-full top-0 z-50" role="navigation">
        <div className="w-full bg-black border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex-1 flex justify-start">
                <Link href="/" className="hover:opacity-90 transition-opacity">
                  <Logo />
                </Link>
              </div>
              <div className="flex-1 flex justify-end">
                <Link href="/Login">
                  <Button 
                    variant="outline" 
                    className="bg-[#1f1f1f] border-1 px-6 py-6 border-gray-400 rounded-full text-white hover:text-gray-600 transition-all duration-300"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const getNavigationLinks = () => {
    if (isGitHubUser) {
      return [
        { href: "/Application", label: "Application", icon: FolderGit2 }
      ];
    } else if (isGoogleUser) {
      return [
        { href: "/DashBoard", label: "Dashboard", icon: LayoutDashboard }
      ];
    }
    return [];
  };
  
  const navigationLinks = getNavigationLinks();

  return (
    <nav className="fixed w-full top-0 z-50" role="navigation">
      <div className="w-full bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-1 flex justify-start">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Logo />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 justify-center">
              <div className="flex items-center space-x-16">
                {navigationLinks.map(({ href, label }) => (
                  <NavLink key={href} href={href}>{label}</NavLink>
                ))}
              </div>
            </div>

            {/* Right Section - Notifications, Profile, Logout */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-6">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:text-[#a6ff00]"
                onClick={handleNotifications}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
                
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full overflow-hidden">
                <User className="h-10 w-10 text-gray-300" />
              </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-black border border-white/10">
                <div className="px-2 py-2 text-sm text-white/70">
                  {user.email}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => router.push('/Profile')} className="text-white hover:text-[#a6ff00] cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-400 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-white p-0 hover:bg-transparent hover:text-[#a6ff00]"
                  >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full bg-black border-white/10">
                  <SheetHeader className="border-b border-white/10 pb-4">
                    <SheetTitle className="text-white">Menu</SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* User Profile Section */}
                    <div className="flex items-center space-x-4 px-2">
                      <img
                        src={photoURL}
                        alt="Profile"
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{user.displayName}</p>
                        <p className="text-xs text-white/70">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {navigationLinks.map(({ href, label, icon: Icon }) => (
                        <MobileNavLink key={href} href={href} onClick={() => setIsMenuOpen(false)}>
                          <Icon className="mr-3 h-5 w-5" />
                          {label}
                        </MobileNavLink>
                      ))}
                    </div>

                    <div className="border-t border-white/10 pt-4 space-y-1">
                      <MobileNavLink href="/Notification" onClick={() => setIsMenuOpen(false)}>
                        <Bell className="mr-3 h-5 w-5" />
                        Notifications
                      </MobileNavLink>
                      <MobileNavLink href="/Profile" onClick={() => setIsMenuOpen(false)}>
                        <User className="mr-3 h-5 w-5" />
                        Profile
                      </MobileNavLink>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children }) => (
  <Link
    href={href}
    className="text-white/70 hover:text-white transition-colors duration-300 text-base font-medium"
  >
    {children}
  </Link>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center px-2 py-2 text-base font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
  >
    {children}
  </Link>
);

export default Navbar;