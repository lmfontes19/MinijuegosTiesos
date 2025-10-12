/**
 * Authentication utility functions for MinijuegosTiesos frontend
 */

/**
 * Processes the authentication response from the backend after Google login
 * This function should be called when the user is redirected back from Google auth
 * @param {object} authResponse - The authentication response from the backend
 * @returns {object} - Auth result with success status and additional info
 */
export const processGoogleAuthResponse = (authResponse) => {
  try {
    if (!authResponse || !authResponse.token) {
      console.error('Invalid auth response:', authResponse);
      return { success: false };
    }

    // Store authentication data in localStorage
    localStorage.setItem('CTtoken', authResponse.token);
    localStorage.setItem('userId', authResponse.user.userId);
    localStorage.setItem('userName', authResponse.user.username);

    // Check if this user needs to complete profile data
    // birthDateNeeded will be true if the user was created with a default date
    const needsProfileCompletion = authResponse.user.birthDateNeeded === true;

    return {
      success: true,
      needsProfileCompletion
    };
  } catch (error) {
    console.error('Error processing Google auth response:', error);
    return { success: false };
  }
};

/**
 * Checks if the current URL contains authentication data from a Google redirect
 * If it does, processes the data and redirects to the dashboard
 * @returns {object|null} - Error information if there's an error, auth result if successful, null otherwise
 */
export const handleGoogleRedirect = () => {
  // This function should only run in the browser
  if (typeof window === 'undefined') return null;

  // Check for errors in URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get('error');

  if (error) {
    return {
      error: true,
      message: getErrorMessage(error),
      code: error
    };
  }

  // Check if we have auth data from Google
  if (urlParams.has('googleAuth')) {
    try {
      const authData = JSON.parse(decodeURIComponent(urlParams.get('googleAuth')));
      const authResult = processGoogleAuthResponse(authData);

      if (authResult.success) {
        // Instead of immediately redirecting, return the auth result
        // to allow the calling component to show the profile completion modal if needed
        return {
          success: true,
          needsProfileCompletion: authResult.needsProfileCompletion
        };
      } else {
        // Return error information
        return {
          error: true,
          message: 'Failed to process authentication data',
          code: 'process_failed'
        };
      }
    } catch (error) {
      console.error('Error handling Google redirect:', error);
      return {
        error: true,
        message: 'Error processing authentication data',
        code: 'invalid_data'
      };
    }
  }

  return null;
};

/**
 * Updates a Google authenticated user's profile with required data
 * @param {object} userData - User data including dateOfBirth and gender
 * @returns {Promise<boolean>} - Whether the update was successful
 */
export const updateGoogleUserProfile = async (userData) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/update-google-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('CTtoken')}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return true;
  } catch (error) {
    console.error('Error updating Google user profile:', error);
    throw error;
  }
};

/**
 * Redirects user to dashboard after successful login/profile completion
 */
export const redirectToDashboard = () => {
  window.location.replace('/dashboard');
};

/**
 * Gets a human-readable error message based on the error code
 * @param {string} errorCode - The error code from the URL
 * @returns {string} - A human-readable error message
 */
export const getErrorMessage = (errorCode) => {
  const messages = {
    'auth_failed': 'Authentication failed. Please try again.',
    'server_error': 'Server error occurred during authentication.',
    'google_auth_failed': 'Google authentication failed. Please try again.',
    'google_auth_error': 'Error during Google authentication.',
    'invalid_data': 'Invalid authentication data received.',
    'process_failed': 'Failed to process authentication data.',
    'redirect_uri_mismatch': 'Application configuration error. Please contact support.',
  };

  return messages[errorCode] || `Authentication error: ${errorCode}`;
};

/**
 * Checks if the user is authenticated
 * @returns {boolean} - Whether the user is authenticated
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('CTtoken');
  return !!token;
}; 