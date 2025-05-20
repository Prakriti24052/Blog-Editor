import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-100 border-green-400 text-green-700',
          icon: <CheckCircle size={20} />
        };
      case 'error':
        return {
          bgColor: 'bg-red-100 border-red-400 text-red-700',
          icon: <AlertCircle size={20} />
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-100 border-blue-400 text-blue-700',
          icon: <Clock size={20} />
        };
    }
  };

  const { bgColor, icon } = getToastConfig();

  return (
    <div className={`fixed top-4 right-4 px-4 py-3 rounded border-l-4 ${bgColor} shadow-lg z-50 max-w-md animate-in slide-in-from-right-5`}>
      <div className="flex items-start">
        <div className="py-1">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;