'use client'
import React, { useState, useEffect } from 'react';
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
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button';
import ForgotPasswordModal from '@/components/ui/login/ForgotPasswordModal';
import GoogleUserDataModal from '@/components/ui/auth/GoogleUserDataModal';
import { handleGoogleRedirect, updateGoogleUserProfile, redirectToDashboard } from '@/lib/auth';
import GoogleAuthError from '@/components/ui/GoogleAuthError';

const LoginFormContent = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const searchParams = useSearchParams();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [errors, setErrors] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  
  // Google auth profile completion state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalLoading, setProfileModalLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check for error params
    const error = searchParams.get('error');
    if (error === 'google_auth_failed') {
      setLoginError('Google authentication failed. Please try again.');
    } else if (error === 'google_auth_error') {
      setLoginError('An error occurred during Google authentication. Please try again.');
    }
    
    // Handle Google Auth redirect if there's a googleAuth parameter
    const googleAuthResult = handleGoogleRedirect();
    if (googleAuthResult) {
      if (googleAuthResult.error) {
        setLoginError(googleAuthResult.message);
      } else if (googleAuthResult.success && googleAuthResult.needsProfileCompletion) {
        // Show the profile completion modal if needed
        setShowProfileModal(true);
      } else if (googleAuthResult.success) {
        // Redirect to dashboard if login successful and no profile completion needed
        redirectToDashboard();
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('CTtoken', data.CTtoken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.userName);
        window.location.replace('/dashboard');
      } else {
        setLoginError(data.message || 'Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      setLoginError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Detect OS
    let os = 'other';
    if (/Windows NT/i.test(navigator.userAgent)) os = 'windows';
    else if (/Android/i.test(navigator.userAgent)) os = 'android';
    else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) os = 'ios';
    else if (/Mac OS X/i.test(navigator.userAgent)) os = 'macos';
    else if (/Linux/i.test(navigator.userAgent)) os = 'linux';
    
    // Detect browser
    let browser = 'other';
    if (/Chrome/i.test(navigator.userAgent) && !/Chromium|OPR|Edge/i.test(navigator.userAgent)) {
      browser = 'chrome';
    } else if (/Firefox/i.test(navigator.userAgent)) {
      browser = 'firefox';
    } else if (/Safari/i.test(navigator.userAgent) && !/Chrome|Chromium|OPR|Edge/i.test(navigator.userAgent)) {
      browser = 'safari';
    }

    // Get country from IP
    let country = 'Unknown';
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      country = data.country_name || 'Unknown';
    } catch (error) {
      console.error('Error detecting country:', error);
    }

    // Build the Google auth URL with query parameters
    const googleAuthUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`);
    googleAuthUrl.searchParams.append('deviceType', isMobile ? 'Mobile' : 'Desktop');
    googleAuthUrl.searchParams.append('operatingSystem', os);
    googleAuthUrl.searchParams.append('browser', browser);
    googleAuthUrl.searchParams.append('country', country);
    googleAuthUrl.searchParams.append('gender', 'other'); // Default for login
    
    // Redirect to Google auth with all parameters
    window.location.href = googleAuthUrl.toString();
  };

  const openForgotPassword = (e) => {
    e.preventDefault();
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPassword = () => {
    setIsForgotPasswordOpen(false);
  };
  
  // Handler for completing the user profile with date of birth and gender
  const handleProfileSubmit = async (userData) => {
    setProfileModalLoading(true);
    try {
      // Call API to update user profile with the provided data
      await updateGoogleUserProfile(userData);
      
      // Redirect to dashboard after successful update
      redirectToDashboard();
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoginError('Failed to update profile. Please try again.');
      setShowProfileModal(false);
    } finally {
      setProfileModalLoading(false);
    }
  };

  // Render a placeholder during server-side rendering
  if (!isClient) {
    return (
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
  }

  return (
    <section className="py-20 bg-[#1E293B]/50">
      <div className="w-full bg-[#1E293B]/80 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            Welcome Back
          </h1>
          <p className="text-[#6366F1] text-xl font-medium">
            Login to access your MinijuegosTiesos account
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-[#1E293B] rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center mb-4">
              <LogIn className="w-8 h-8 mr-3 text-[#6366F1]" />
              <h2 className="text-2xl font-bold text-white">Login to Your Account</h2>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {loginError && (
                <GoogleAuthError 
                  type="error"
                  message={loginError}
                  onClose={() => setLoginError('')}
                />
              )}
              
              {/* Email */}
              <motion.div variants={itemVariants} className="mb-5">
                <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="your@email.com"
                    className={`w-full bg-[#0F172A] border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email}</p>}
              </motion.div>
              
              {/* Password */}
              <motion.div variants={itemVariants} className="mb-5">
                <label className="block text-gray-300 mb-2 text-sm">Password</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className={`w-full bg-[#0F172A] border ${errors.password ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-red-500 text-xs">{errors.password}</p>}
              </motion.div>

              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={openForgotPassword}
                  className="text-sm text-[#6366F1] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              
              <motion.div 
                variants={itemVariants}
                className="mt-4"
              >
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging In...' : 'Login'}
                </Button>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="mt-4 relative"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
              </motion.div>

              <motion.p 
                variants={itemVariants}
                className="text-center text-gray-400 mt-6"
              >
                Don't have an account? <Link href="/signup" className="text-[#6366F1] hover:underline">Sign Up</Link>
              </motion.p>
            </form>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-[#1E293B] p-8 rounded-xl shadow-lg text-center"
        >
          <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
            Continue Your Gaming Adventure!
          </h3>
          <div className="flex justify-center items-center space-x-6">
            <Award className="w-16 h-16 text-[#10B981]" />
            <p className="text-xl text-gray-300 max-w-2xl">
              Login to access your games, achievements, and leaderboard rankings. Your next high score awaits!
            </p>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={isForgotPasswordOpen}
        onClose={closeForgotPassword}
      />
      
      {/* Google Auth Profile Completion Modal */}
      <GoogleUserDataModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        initialGender="other"
      />
    </section>
  );
};

export default LoginFormContent; 