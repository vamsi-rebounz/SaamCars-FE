import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Server, Database, Globe, CheckCircle, X } from 'lucide-react';

interface AlertStateProps {
  error?: string | null;
  success?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  showIcon?: boolean;
  variant?: 'default' | 'network' | 'server' | 'database' | 'not-found' | 'success';
  className?: string;
  retryText?: string;
  showRetryButton?: boolean;
  showCloseButton?: boolean;
}

const AlertState: React.FC<AlertStateProps> = ({
  error,
  success,
  onRetry,
  onClose,
  title = 'Something went wrong',
  description,
  showIcon = true,
  variant = 'default',
  className = '',
  retryText = 'Try Again',
  showRetryButton = false,
  showCloseButton = true
}) => {
  // If success message is provided, override variant and content
  if (success) {
    variant = 'success';
    title = 'Success!';
    description = success;
  }

  // If no error or success, don't render
  if (!error && !success) return null;

  const getVariantInfo = () => {
    switch (variant) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          iconColor: 'text-green-500',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          title: 'Success!',
          description: success || 'Operation completed successfully.'
        };
      case 'network':
        return {
          icon: WifiOff,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection.'
        };
      case 'server':
        return {
          icon: Server,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title: 'Server Error',
          description: 'The server is experiencing issues. Please try again later.'
        };
      case 'database':
        return {
          icon: Database,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title: 'Data Error',
          description: 'Unable to retrieve data. Please try again.'
        };
      case 'not-found':
        return {
          icon: Globe,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title: 'Not Found',
          description: 'The requested resource could not be found.'
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconColor: 'text-red-500',
          textColor: 'text-red-800',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title,
          description: description || 'An unexpected error occurred. Please try again.'
        };
    }
  };

  const variantInfo = getVariantInfo();
  const IconComponent = variantInfo.icon;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 ${className}`}>
      <div className={`${variantInfo.bgColor} border-l-4 ${variantInfo.borderColor} rounded-lg shadow-lg p-4 animate-slide-down`}>
        <div className="flex items-start space-x-3">
          {showIcon && (
            <div className="flex-shrink-0">
              <IconComponent className={`h-5 w-5 ${variantInfo.iconColor}`} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-base font-semibold ${variantInfo.textColor} mb-1`}>
              {variantInfo.title}
            </h3>
            
            <p className={`text-sm ${variantInfo.textColor.replace('800', '700')} leading-relaxed`}>
              {variantInfo.description}
            </p>

            {showRetryButton && onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center px-3 py-2 mt-3 rounded-md text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantInfo.buttonColor}`}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryText}
              </button>
            )}
          </div>

          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className={`flex-shrink-0 ml-2 ${variantInfo.textColor.replace('800', '600')} hover:${variantInfo.textColor.replace('800', '800')} transition-colors`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Keep the old ErrorState for backward compatibility
const ErrorState: React.FC<Omit<AlertStateProps, 'success' | 'onClose' | 'showCloseButton'>> = (props) => {
  return <AlertState {...props} />;
};

export default AlertState;
export { ErrorState }; 