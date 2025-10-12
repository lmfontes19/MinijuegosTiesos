'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, User } from 'lucide-react';
import ChatButton from '../ui/chat/ChatButton';

interface UserProfile {
  picture: string;
}

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      const CTtoken = localStorage.getItem('CTtoken');
      
      if (!CTtoken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/navbar/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CTtoken}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
          // Fetch user profile picture if available
          const userProfilePic = localStorage.getItem('userProfilePicture');
          if (userProfilePic) {
            setUserProfile({ picture: userProfilePic });
          }
        } else {
          // Clear invalid credentials
          localStorage.removeItem('CTtoken');
          localStorage.removeItem('userId');
          localStorage.removeItem('userProfilePicture');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('CTtoken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfilePicture');
    setIsAuthenticated(false);
    window.location.replace('/');
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const AuthLinks = () => (
    <>
      {isLoading ? (
        <div className="w-20 h-10 bg-gray-700 animate-pulse rounded-lg"></div>
      ) : isAuthenticated ? (
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard" 
            className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-[#6366F1] border border-[#6366F1] hover:bg-[#6366F1]/10 transition-colors cursor-pointer flex items-center gap-2"
            aria-label="Log out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="px-4 py-2 rounded-lg text-[#6366F1] border border-[#6366F1] hover:bg-[#6366F1]/10 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/signup" 
            className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white transition-colors"
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  );

  const NavLinks = () => (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
      <Link href="/news" className="text-white hover:text-[#6366F1] transition-colors">News</Link>
      <Link href="/leaderboard" className="text-white hover:text-[#6366F1] transition-colors">Leaderboard</Link>
      <Link href="/about" className="text-white hover:text-[#6366F1] transition-colors">About</Link>
      <Link href="/contact" className="text-white hover:text-[#6366F1] transition-colors">Contact</Link>
    </div>
  );

  return (
    <nav className="fixed w-full z-50 bg-[#0F172A]/80 backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
        <Link href="/" className="flex-shrink-0">
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#6366F1]">Minijuegos</span>
            <span className="text-white">Tiesos</span>
          </h1>
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className="md:hidden text-white focus:outline-none" 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center">
          <AuthLinks />
        </div>
        
        {/* Chat Button (desktop) - always at the far right */}
        {isAuthenticated && (
          <div className="hidden md:flex ml-4">
            <ChatButton />
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu - Animated */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0F172A] py-4 px-4 space-y-4">
          <NavLinks />
          <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between">
            <AuthLinks />
            {isAuthenticated && <ChatButton />}
          </div>
        </div>
      </div>
    </nav>
  );
}