import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-400',
          text: 'text-green-700',
          icon: <CheckCircle className="w-5 h-5 text-green-400" />
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-700',
          icon: <AlertCircle className="w-5 h-5 text-red-400" />
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          text: 'text-blue-700',
          icon: <Info className="w-5 h-5 text-blue-400" />
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down w-full max-w-md mx-auto px-4">
      <div className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg shadow-lg p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          {styles.icon}
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`${styles.text} hover:opacity-70 transition-opacity ml-4 flex-shrink-0`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast; 