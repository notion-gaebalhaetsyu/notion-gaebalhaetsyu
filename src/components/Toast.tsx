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
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-ink text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-3 animate-bounce z-50">
          <span>🍞</span> {toast}
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
