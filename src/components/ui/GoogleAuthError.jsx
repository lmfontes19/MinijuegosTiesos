import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

/**
 * Component to display error messages related to Google authentication
 * 
 * @param {Object} props
 * @param {string} props.type - Message type: "error" or "info"
 * @param {string} props.message - Message to display
 * @param {string} props.details - Additional details (optional)
 * @param {Function} props.onClose - Function to close the message (optional)
 */
const GoogleAuthError = ({ type = "error", message, details, onClose }) => {
  const bgColor = type === "error" ? "bg-red-500/10" : "bg-blue-500/10";
  const borderColor = type === "error" ? "border-red-500" : "border-blue-500";
  const textColor = type === "error" ? "text-red-500" : "text-blue-500";
  const Icon = type === "error" ? AlertTriangle : Info;

  return (
    <div className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded mb-6 relative`}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {details && <p className="mt-1 text-sm opacity-80">{details}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthError; 