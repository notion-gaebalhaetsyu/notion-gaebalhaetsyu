"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 2600);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-3.5 rounded-2xl shadow-2xl font-bold flex items-center gap-2.5 animate-bounce z-50">
          <img src="/pizza_icon.png" alt="파비콘" className="w-5 h-5 object-contain flex-shrink-0" />
          <span className="whitespace-nowrap text-sm sm:text-base">{toast.replace(/🍕/g, '').trim()}</span>
          <img src="/pizza_icon.png" alt="파비콘" className="w-5 h-5 object-contain flex-shrink-0" />
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
