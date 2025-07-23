import React from 'react';

export default function Loader({ size = 'medium', text = 'Loading...' }) {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-4 w-4';
      case 'large':
        return 'h-12 w-12';
      case 'medium':
      default:
        return 'h-8 w-8';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 ${getSizeClasses()}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm">{text}</p>
      )}
    </div>
  );
}

export function SpinnerDots({ size = 'medium' }) {
  const dotSize = size === 'small' ? 'w-1 h-1' : size === 'large' ? 'w-3 h-3' : 'w-2 h-2';
  
  return (
    <div className="flex space-x-1">
      <div className={`${dotSize} bg-indigo-600 rounded-full animate-bounce`}></div>
      <div className={`${dotSize} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
      <div className={`${dotSize} bg-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
}

export function SpinnerPulse({ size = 'medium' }) {
  const sizeClasses = size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-12 w-12' : 'h-8 w-8';
  
  return (
    <div className={`${sizeClasses} bg-indigo-600 rounded-full animate-pulse`}></div>
  );
}

export function PageLoader({ message = 'Loading page...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ size = 'small', className = '' }) {
  const sizeClasses = size === 'small' ? 'h-4 w-4' : size === 'large' ? 'h-6 w-6' : 'h-5 w-5';
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${sizeClasses} ${className}`}></div>
  );
}
