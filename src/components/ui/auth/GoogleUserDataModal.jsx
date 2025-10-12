import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, X, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/button';

const GoogleUserDataModal = ({ isOpen, onClose, onSubmit, initialGender = 'other' }) => {
  // Generate current year and years for the dropdown (100 years ago to current year - 18)
  const currentYear = new Date().getFullYear();
  const maxBirthYear = currentYear - 18; // Must be at least 18 years old
  const years = Array.from({ length: 100 }, (_, i) => maxBirthYear - i);
  
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

  // State for form fields and validation
  const [formData, setFormData] = useState({
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: initialGender
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for this field when changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
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

    if (!formData.gender) newErrors.gender = "Please select your gender";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setFormStatus({ type: '', message: '' });

    try {
      // Format date of birth as YYYY-MM-DD
      const dateOfBirth = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      
      // Call the provided onSubmit function with formatted data
      await onSubmit({
        dateOfBirth,
        gender: formData.gender
      });
      
      // Show success message
      setFormStatus({
        type: 'success',
        message: 'Information saved successfully!'
      });
      
      // Close modal after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus({
        type: 'error',
        message: error.message || 'Failed to save information. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1E293B] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-300 mb-6">
                Please provide your date of birth and gender to complete your account setup and access available tasks.
              </p>
              
              {formStatus.message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center ${
                  formStatus.type === 'success' ? 'bg-green-800/30 border border-green-700' : 'bg-red-800/30 border border-red-700'
                }`}>
                  {formStatus.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  )}
                  <p className="text-white text-sm">{formStatus.message}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Date of Birth */}
                <div className="mb-6">
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
                </div>
                
                {/* Gender Selection */}
                <div className="mb-6">
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
                    {errors.gender && <p className="mt-1 text-red-500 text-xs">{errors.gender}</p>}
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#6366F1] to-[#A5B4FC] text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Continue'}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GoogleUserDataModal; 