'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Award,
  UserPlus,
  ArrowLeft,
  Calendar,
  MapPin,
  UserCheck,
  Users,
  Gift
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button';
import { handleGoogleRedirect, updateGoogleUserProfile, redirectToDashboard } from '@/lib/auth';
import GoogleAuthError from '@/components/ui/GoogleAuthError';
import GoogleUserDataModal from '@/components/ui/auth/GoogleUserDataModal';

const SignupFormContent = () => {
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
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    deviceType: '',
    operatingSystem: '',
    browser: '',
    country: '',
    gender: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    terms: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [errors, setErrors] = useState({});
  const [isClient, setIsClient] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalLoading, setProfileModalLoading] = useState(false);

  // Generate years for the dropdown (100 years ago to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  // Generate months for the dropdown
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate days for the dropdown
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    return day < 10 ? `0${day}` : `${day}`;
  });

  // Auto-detect device info and country on component mount
  useEffect(() => {
    setIsClient(true);

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

    // Update form with device info
    setFormData(prev => ({
      ...prev,
      deviceType: isMobile ? 'Mobile' : 'Desktop',
      operatingSystem: os,
      browser: browser
    }));

    // Detect country using IP geolocation API
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        setFormData(prev => ({
          ...prev,
          country: data.country_name || ''
        }));
      })
      .catch(error => {
        console.error('Error detecting country:', error);
      });

    // Check for Google Auth redirect if there's a googleAuth parameter
    const googleAuthResult = handleGoogleRedirect();
    if (googleAuthResult) {
      if (googleAuthResult.error) {
        setSignupError(googleAuthResult.message);
      } else if (googleAuthResult.success && googleAuthResult.needsProfileCompletion) {
        // Show the profile completion modal if needed
        setShowProfileModal(true);
      } else if (googleAuthResult.success) {
        // Redirect to dashboard if signup successful and no profile completion needed
        redirectToDashboard();
      }
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    setSignupError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.gender) newErrors.gender = "Please select your gender";

    // Validate date of birth
    if (!formData.birthDay) newErrors.birthDay = "Day is required";
    if (!formData.birthMonth) newErrors.birthMonth = "Month is required";
    if (!formData.birthYear) newErrors.birthYear = "Year is required";

    // Check if user is at least 18 years old
    if (formData.birthDay && formData.birthMonth && formData.birthYear) {
      const birthDate = new Date(`${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - (birthDate.getMonth() - 1);

      // If birthday hasn't occurred yet this year, subtract one from age
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        const ageAdjusted = age - 1;
        if (ageAdjusted < 18) {
          newErrors.birthYear = "You must be at least 18 years old to create an account";
        }
      } else if (age < 18) {
        newErrors.birthYear = "You must be at least 18 years old to create an account";
      }
    }

    if (!formData.terms) newErrors.terms = "You must accept the Terms and Conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSignupError('');

    // Format date of birth as YYYY-MM-DD
    const dateOfBirth = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;

    const signupData = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      gender: formData.gender,
      dateOfBirth: dateOfBirth,
      deviceType: formData.deviceType,
      operatingSystem: formData.operatingSystem,
      browser: formData.browser,
      country: formData.country
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('CTtoken', data.CTtoken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.userName);
        window.location.replace('/dashboard');
      } else {
        setSignupError(data.message || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      setSignupError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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

    // Get gender from form - use only valid values
    let gender = formData.gender || 'other';
    // Ensure gender is one of the valid options
    if (!['male', 'female', 'other', 'prefer_not_to_say'].includes(gender.toLowerCase())) {
      gender = 'other';
    }

    // Build the Google auth URL with query parameters
    const googleAuthUrl = new URL(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/google`);
    googleAuthUrl.searchParams.append('deviceType', isMobile ? 'Mobile' : 'Desktop');
    googleAuthUrl.searchParams.append('operatingSystem', os);
    googleAuthUrl.searchParams.append('browser', browser);
    googleAuthUrl.searchParams.append('country', country);
    googleAuthUrl.searchParams.append('gender', gender);

    // Redirect to Google auth with all parameters
    window.location.href = googleAuthUrl.toString();
  };

  // Add handler for profile completion
  const handleProfileSubmit = async (userData) => {
    setProfileModalLoading(true);
    try {
      // Call API to update user profile with the provided data
      await updateGoogleUserProfile(userData);

      // Redirect to dashboard after successful update
      redirectToDashboard();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSignupError('Failed to update profile. Please try again.');
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
            Join MinijuegosTiesos
          </h1>
          <p className="text-[#6366F1] text-xl font-medium">
            Create an account
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
            Join MinijuegosTiesos
          </h1>
          <p className="text-[#6366F1] text-xl font-medium">
            Create an account
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
              <UserPlus className="w-8 h-8 mr-3 text-[#6366F1]" />
              <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {signupError && (
                <GoogleAuthError
                  type="error"
                  message={signupError}
                  onClose={() => setSignupError('')}
                />
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <motion.div variants={itemVariants} className="mb-5">
                  <label className="block text-gray-300 mb-2 text-sm">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="Enter your full name"
                      className={`w-full bg-[#0F172A] border ${errors.fullName ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                    />
                  </div>
                  {errors.fullName && <p className="mt-1 text-red-500 text-xs">{errors.fullName}</p>}
                </motion.div>

                {/* Username */}
                <motion.div variants={itemVariants} className="mb-5">
                  <label className="block text-gray-300 mb-2 text-sm">Username</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="Choose a username"
                      className={`w-full bg-[#0F172A] border ${errors.username ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                    />
                  </div>
                  {errors.username && <p className="mt-1 text-red-500 text-xs">{errors.username}</p>}
                </motion.div>
              </div>

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

              <div className="grid md:grid-cols-2 gap-6">
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
                      placeholder="Create a strong password"
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

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="mb-5">
                  <label className="block text-gray-300 mb-2 text-sm">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      className={`w-full bg-[#0F172A] border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-red-500 text-xs">{errors.confirmPassword}</p>}
                </motion.div>
              </div>

              {/* Date of Birth */}
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-gray-300 mb-2 text-sm">Date of Birth</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Day */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <select
                      name="birthDay"
                      value={formData.birthDay}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full bg-[#0F172A] border ${errors.birthDay ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                    >
                      <option value="" disabled>Day</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    {errors.birthDay && <p className="mt-1 text-red-500 text-xs">{errors.birthDay}</p>}
                  </div>

                  {/* Month */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <select
                      name="birthMonth"
                      value={formData.birthMonth}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full bg-[#0F172A] border ${errors.birthMonth ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                    >
                      <option value="" disabled>Month</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                    {errors.birthMonth && <p className="mt-1 text-red-500 text-xs">{errors.birthMonth}</p>}
                  </div>

                  {/* Year */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <select
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full bg-[#0F172A] border ${errors.birthYear ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                    >
                      <option value="" disabled>Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {errors.birthYear && <p className="mt-1 text-red-500 text-xs">{errors.birthYear}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Gender */}
              <motion.div variants={itemVariants} className="mb-5">
                <label className="block text-gray-300 mb-2 text-sm">Gender</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full bg-[#0F172A] border ${errors.gender ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                  >
                    <option value="" disabled>Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                {errors.gender && <p className="mt-1 text-red-500 text-xs">{errors.gender}</p>}
              </motion.div>

              {/* Terms */}
              <motion.div variants={itemVariants} className="flex items-center mt-6">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`h-4 w-4 rounded border-gray-700 bg-[#0F172A] text-[#6366F1] focus:ring-[#6366F1] ${errors.terms ? 'border-red-500 my-8' : ''
                    }`}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </motion.div>
              {errors.terms && (
                <motion.p
                  variants={itemVariants}
                  className="text-sm text-red-500 -mt-4"
                >
                  {errors.terms}
                </motion.p>
              )}

              <motion.div
                variants={itemVariants}
                className="mt-8"
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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
                Already have an account? <Link href="/login" className="text-[#6366F1] hover:underline">Login</Link>
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
  Start Playing Today!
</h3>
<div className="flex justify-center items-center space-x-6">
  <Award className="w-16 h-16 text-[#10B981]" />
  <p className="text-xl text-gray-300 max-w-2xl">
    Play fun mini-games and compete with your friends. Join our community and climb to the top of the leaderboard!
  </p>
</div>

        </motion.div>
      </div>

      <GoogleUserDataModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSubmit={handleProfileSubmit}
        initialGender={formData.gender || 'other'}
      />
    </section>
  );
};

export default SignupFormContent; 