import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  variant?: 'default' | 'inline' | 'fullscreen';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  showSpinner = true,
  variant = 'default',
  className = '',
  size = 'md'
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-4',
          spinner: 'h-4 w-4',
          text: 'text-sm'
        };
      case 'lg':
        return {
          container: 'p-8',
          spinner: 'h-12 w-12',
          text: 'text-lg'
        };
      default:
        return {
          container: 'p-6',
          spinner: 'h-8 w-8',
          text: 'text-base'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const getVariantClasses = () => {
    switch (variant) {
      case 'inline':
        return 'inline-flex items-center space-x-2';
      case 'fullscreen':
        return 'fixed inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-50';
      default:
        return 'flex items-center justify-center min-h-[200px] bg-gray-50 rounded-xl';
    }
  };

  return (
    <div className={`${getVariantClasses()} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {showSpinner && (
          <div className="relative">
            <div className={`${sizeClasses.spinner} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
            <RefreshCw className={`${sizeClasses.spinner} absolute inset-0 text-blue-600 animate-pulse opacity-50`} />
          </div>
        )}
        
        {message && (
          <p className={`${sizeClasses.text} text-gray-600 font-medium text-center`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingState; 