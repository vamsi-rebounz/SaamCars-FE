import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface AlertProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const Alert: React.FC<AlertProps> = ({
  message,
  type = 'success',
  onClose,
  autoClose = true,
  autoCloseTime = 3000
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md ${currentStyle.bg} border-l-4 ${currentStyle.border} p-4 rounded-lg shadow-lg`}
      role="alert"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {currentStyle.icon}
          <p className={`ml-3 font-medium ${currentStyle.text}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${currentStyle.text} hover:opacity-70 transition-opacity`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Alert; 