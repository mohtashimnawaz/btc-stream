import toast from 'react-hot-toast';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';

const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1f2937',
    color: '#fff',
    border: '1px solid #374151',
    borderRadius: '12px',
    fontSize: '14px',
    maxWidth: '400px',
  },
};

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      ...toastOptions,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      style: {
        ...toastOptions.style,
        borderColor: '#10b981',
      },
      ...options,
    });
  },
  
  error: (message, options = {}) => {
    toast.error(message, {
      ...toastOptions,
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      style: {
        ...toastOptions.style,
        borderColor: '#ef4444',
      },
      ...options,
    });
  },
  
  warning: (message, options = {}) => {
    toast(message, {
      ...toastOptions,
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      style: {
        ...toastOptions.style,
        borderColor: '#f59e0b',
      },
      ...options,
    });
  },
  
  info: (message, options = {}) => {
    toast(message, {
      ...toastOptions,
      icon: <Info className="w-5 h-5 text-blue-500" />,
      style: {
        ...toastOptions.style,
        borderColor: '#3b82f6',
      },
      ...options,
    });
  },
  
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...toastOptions,
      ...options,
    });
  },
  
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },
  
  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, messages, {
      ...toastOptions,
      ...options,
    });
  },
};

export default showToast;
