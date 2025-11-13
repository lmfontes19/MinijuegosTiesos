'use client'
import { useEffect, useState } from 'react';
import { Eye, EyeOff, RefreshCw, CheckCircle, AlertCircle, Upload, X } from 'lucide-react';

export const SettingsContent = () => {
  const [userData, setUserData] = useState({
    fullName: '',
    username: '',
    gender: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    showNewPassword: false,
    showConfirmPassword: false
  });

  const [notification, setNotification] = useState({
    show: false,
    type: '', // 'success' or 'error'
    message: ''
  });

  const [loading, setLoading] = useState({
    profile: false,
    password: false,
  });

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Adjust based on your project setup

  // Show notification function
  const showNotification = (type, message) => {
    setNotification({
      show: true,
      type,
      message
    });

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleUserDataChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordData({
      ...passwordData,
      [field]: !passwordData[field]
    });
  };

  // Function to simplify OS detection
  const detectSimplifiedOS = (userAgent) => {
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Mac OS X/i.test(userAgent)) return 'macOS'; // Keeping macOS as fallback
    return 'Unknown';
  };

  // Fetch user profile information
  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('CTtoken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load profile information');
      }
      
      const data = await response.json();
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      showNotification('error', 'Failed to load profile information. Please try again.');
    }
  };

  // API call to save profile changes
  const saveProfileChanges = async () => {
    setLoading(prev => ({ ...prev, profile: true }));
    
    try {
      // Validate fields
      if (!userData.fullName.trim()) {
        throw new Error('Full name cannot be empty');
      }
      
      if (!userData.username.trim()) {
        throw new Error('Username cannot be empty');
      }
      
      // Send data to backend API
      const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('CTtoken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: userData.fullName,
          username: userData.username,
          gender: userData.gender
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      showNotification('success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      showNotification('error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };

  // API call to update password
  const updatePassword = async () => {
    setLoading(prev => ({ ...prev, password: true }));
    
    try {
      // Validate password
      if (passwordData.newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Send password data to backend API
      const response = await fetch(`${API_BASE_URL}/api/settings/password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('CTtoken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update password');
      }
      
      // Reset password fields
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
        showNewPassword: false,
        showConfirmPassword: false
      });
      
      showNotification('success', 'Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      showNotification('error', error.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div>
      <h2 className="text-white font-bold mb-4">Settings</h2>
      
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-800/30 border border-green-700' : 'bg-red-800/30 border border-red-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
          )}
          <p className="text-white text-sm">{notification.message}</p>
        </div>
      )}
      
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 mb-6">
        <h3 className="text-white font-medium mb-3">Profile Information</h3>
        
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-white text-sm"
              value={userData.fullName}
              onChange={handleUserDataChange}
            />
          </div>
          
          {/* Username */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Username</label>
            <input 
              type="text" 
              name="username"
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-white text-sm"
              value={userData.username}
              onChange={handleUserDataChange}
            />
          </div>
          
          {/* Gender Selection */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Gender</label>
            <select 
              name="gender" 
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-white text-sm"
              value={userData.gender}
              onChange={handleUserDataChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
          
          {/* Email - Non-editable */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Email</label>
            <input 
              type="email" 
              className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-white text-sm cursor-not-allowed opacity-70"
              value={userData.email}
              disabled
            />
          </div>
          
          <button 
            className={`bg-[#6366F1] text-white px-4 py-2 rounded text-sm hover:bg-[#4F46E5] transition-colors flex items-center justify-center ${
              loading.profile ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            onClick={saveProfileChanges}
            disabled={loading.profile}
          >
            {loading.profile ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
      
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-4 mb-6">
        <h3 className="text-white font-medium mb-3">Change Password</h3>
        
        <div className="space-y-4">
          {/* New Password */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">New Password</label>
            <div className="relative">
              <input 
                type={passwordData.showNewPassword ? "text" : "password"}
                name="newPassword"
                className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-white text-sm pr-10"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
              <button 
                type="button"
                className="absolute right-2 top-2 text-gray-400"
                onClick={() => togglePasswordVisibility('showNewPassword')}
              >
                {passwordData.showNewPassword ? 
                  <EyeOff className="w-4 h-4" /> : 
                  <Eye className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
          
          {/* Confirm New Password */}
          <div>
            <label className="text-gray-400 text-sm block mb-1">Confirm New Password</label>
            <div className="relative">
              <input 
                type={passwordData.showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="w-full bg-[#0F172A] border border-[#334155] rounded p-2 text-white text-sm pr-10"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
              <button 
                type="button"
                className="absolute right-2 top-2 text-gray-400"
                onClick={() => togglePasswordVisibility('showConfirmPassword')}
              >
                {passwordData.showConfirmPassword ? 
                  <EyeOff className="w-4 h-4" /> : 
                  <Eye className="w-4 h-4" />
                }
              </button>
            </div>
          </div>
          
          <button 
            className={`bg-[#6366F1] text-white px-4 py-2 rounded text-sm hover:bg-[#4F46E5] transition-colors flex items-center justify-center ${
              loading.password ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            onClick={updatePassword}
            disabled={loading.password}
          >
            {loading.password ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
};