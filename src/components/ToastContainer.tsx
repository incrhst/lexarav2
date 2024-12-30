import React from 'react';
import Toast from './Toast';
import { useToast } from '../contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
}