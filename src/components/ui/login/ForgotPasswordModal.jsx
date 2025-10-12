'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/button';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  // States
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  // Handlers
  const handleChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setServerError('');
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email address is invalid");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setServerError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setServerError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setEmailError('');
    setIsSuccess(false);
    setServerError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          <motion.div 
            className="relative w-full max-w-md mx-4" 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <div className="flex items-center">
                  {isSuccess ? (
                    <CheckCircle className="w-6 h-6 mr-3 text-[#10B981]" />
                  ) : (
                    <Mail className="w-6 h-6 mr-3 text-[#6366F1]" />
                  )}
                  <h2 className="text-xl font-bold text-white">
                    {isSuccess ? 'Email Sent' : 'Forgot Password'}
                  </h2>
                </div>
                <button 
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                {isSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircle className="w-16 h-16 text-[#10B981] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-3">Recovery Email Sent</h3>
                    <p className="text-gray-300 mb-6">
                      If an account exists with the email <span className="text-[#6366F1] font-medium">{email}</span>, 
                      you'll receive a password reset link shortly.
                    </p>
                    <div className="flex flex-col space-y-3">
                      <Button 
                        onClick={handleReset}
                        className="w-full bg-[#1E293B] border border-[#6366F1] text-[#6366F1] font-medium py-3 px-6 rounded-lg hover:bg-[#6366F1]/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
                      >
                        Send another email
                      </Button>
                      <Button 
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {serverError && (
                      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-6">
                        {serverError}
                      </div>
                    )}

                    <p className="text-gray-300 mb-6">
                      Enter your email address, and we'll send you a link to reset your password.
                    </p>
                    
                    <div className="mb-5">
                      <label className="block text-gray-300 mb-2 text-sm">Email Address</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="your@email.com"
                          className={`w-full bg-[#0F172A] border ${emailError ? 'border-red-500' : 'border-gray-700'} rounded-lg py-3 px-10 text-white focus:outline-none focus:border-[#6366F1] transition-colors`}
                        />
                      </div>
                      {emailError && <p className="mt-1 text-red-500 text-xs">{emailError}</p>}
                    </div>

                    <div className="flex space-x-4 mt-6">
                      <Button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-[#1E293B] border border-gray-700 text-gray-300 font-medium py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-opacity-50"
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] text-white font-medium py-3 px-6 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Sending...' : 'Send Link'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;