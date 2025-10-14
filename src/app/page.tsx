'use client'

import React, { useEffect, useState } from 'react';
import Hero from '@/components/ui/landing/hero';
import ValueProposition from '@/components/ui/landing/valueProposition';
import Testimonials from '@/components/ui/landing/testimonials';
import AboutUs from '@/components/ui/landing/aboutUs';
import FeaturedGames from '@/components/ui/landing/featuredGames';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [resetStatus, setResetStatus] = useState<'validating' | 'success' | 'error' | null>(null);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    // Handling referral code
    const urlParams = new URLSearchParams(window.location.search);

    // Handling password reset
    const resetToken = urlParams.get('reset');
    
    if (resetToken) {
      setResetStatus('validating');
      validateResetToken(resetToken);
    }
  }, []);

  const validateResetToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/password-reset/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save auth data to localStorage
        localStorage.setItem('CTtoken', data.CTtoken);
        localStorage.setItem('userId', data.userId.toString());
        localStorage.setItem('userName', data.userName);
        
        setResetStatus('success');
        setResetMessage('Your account has been authenticated. You can now reset your password in the settings.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard#settings');
        }, 3000);
      } else {
        setResetStatus('error');
        setResetMessage(data.message || 'Invalid or expired reset link. Please try again.');
      }
    } catch (error) {
      setResetStatus('error');
      setResetMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white antialiased overflow-x-hidden">
      {resetStatus && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4`}>
          <div className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden max-w-md w-full">
            <div className="p-6 text-center">
              {resetStatus === 'validating' && (
                <>
                  <div className="animate-pulse flex justify-center mb-4">
                    <div className="w-16 h-16 bg-[#6366F1] rounded-full opacity-75"></div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Validating Reset Link</h2>
                  <p className="text-gray-300">Please wait while we verify your reset link...</p>
                </>
              )}
              
              {resetStatus === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
                  <p className="text-gray-300 mb-4">{resetMessage}</p>
                  <p className="text-gray-400 text-sm">Redirecting to settings page...</p>
                </>
              )}
              
              {resetStatus === 'error' && (
                <>
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                  <p className="text-gray-300 mb-6">{resetMessage}</p>
                  <button 
                    onClick={() => setResetStatus(null)}
                    className="bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      <Hero />
      <ValueProposition />
      <Testimonials />
      <AboutUs />
      <FeaturedGames />
    </div>
  );
}

/*
Quitar todo lo del codigo de referido
*/