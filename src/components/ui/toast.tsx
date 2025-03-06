import { Toaster as HotToaster } from 'react-hot-toast';
import React from 'react';

interface ToasterProps {
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}

export function Toaster({ position = "top-center" }: ToasterProps) {
  return (
    <HotToaster
      position={position}
      toastOptions={{
        className: "netflix-scale-in",
        style: {
          background: '#181818',
          color: '#FFF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '14px',
          maxWidth: '500px',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#E50914',
            secondary: '#FFFFFF',
          },
          duration: 4000,
        },
        error: {
          iconTheme: {
            primary: '#E50914',
            secondary: '#FFFFFF',
          },
          duration: 5000,
        },
      }}
    />
  );
}