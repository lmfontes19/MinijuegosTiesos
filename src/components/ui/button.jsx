import React from 'react';
import { cn } from '@/lib/utils';

export default function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "",
  isLoading = false,
  loadingText = "Loading...",
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  ...props 
}) {
  // Base styles
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] disabled:opacity-60 disabled:cursor-not-allowed";
  
  // Variant styles
  const variants = {
    primary: "bg-[#6366F1] hover:bg-[#4F46E5] focus:ring-[#6366F1] text-white",
    secondary: "bg-[#1E293B] hover:bg-[#334155] focus:ring-[#1E293B] text-white",
    outline: "border border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/10 focus:ring-[#6366F1]",
    ghost: "text-[#6366F1] hover:bg-[#6366F1]/10 focus:ring-[#6366F1]",
    danger: "bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white",
    success: "bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white",
    dashboard: "bg-[#10B981] hover:bg-[#059669] focus:ring-[#10B981] text-white"
  };
  
  // Size styles
  const sizes = {
    xs: "text-xs px-2 py-1",
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5",
    xl: "text-lg px-6 py-3"
  };

  // Loading state
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button 
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}