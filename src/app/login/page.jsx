'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogIn,
  Award
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Button from '@/components/ui/button';
import ForgotPasswordModal from '@/components/ui/login/ForgotPasswordModal';
import GoogleUserDataModal from '@/components/ui/auth/GoogleUserDataModal';
import { handleGoogleRedirect, updateGoogleUserProfile, redirectToDashboard } from '@/lib/auth';
import GoogleAuthError from '@/components/ui/GoogleAuthError';

// Dynamic import of LoginForm component to avoid issues with useSearchParams
const LoginFormContent = dynamic(() => import('@/components/ui/login/LoginFormContent'), { 
  ssr: false,
  loading: () => <LoginFormLoading />
});

// Componente de carga para mostrar mientras se carga el LoginFormContent
const LoginFormLoading = () => (
  <section className="py-20 bg-[#1E293B]/50">
    <div className="w-full bg-[#1E293B]/80 py-16 text-center">
      <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
        Welcome Back
      </h1>
      <p className="text-[#6366F1] text-xl font-medium">
        Login to access your MinijuegosTiesos account
      </p>
    </div>
    <div className="max-w-3xl mx-auto px-4 pt-12">
      <div className="bg-[#1E293B] rounded-xl shadow-lg overflow-hidden p-8">
        <div className="flex justify-center">
          <p className="text-white">Loading form...</p>
        </div>
      </div>
    </div>
  </section>
);

// Main component to be exported
const LoginPage = () => {
  return (
    <Suspense fallback={<LoginFormLoading />}>
      <LoginFormContent />
    </Suspense>
  );
};

export default LoginPage;