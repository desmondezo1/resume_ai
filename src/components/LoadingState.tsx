import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="fixed inset-0 bg-netflix-black flex flex-col items-center justify-center z-50">
      <div className="relative w-full max-w-md mx-auto">
        {/* Netflix "N" logo animation */}
        <div className="w-16 h-24 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-netflix-red animate-pulse rounded-sm"></div>
          <div className="absolute top-0 bottom-0 w-2 bg-netflix-black left-3 transform skew-x-[20deg]"></div>
          <div className="absolute top-0 bottom-0 w-2 bg-netflix-black right-3 transform skew-x-[-20deg]"></div>
        </div>
        
        <div className="space-y-6 text-center netflix-fade-in">
          <h3 className="text-xl md:text-2xl font-light text-netflix-light">{message}</h3>
          
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-3 h-3 bg-netflix-red rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-netflix-gray text-sm">
          Powered by AI Resume Analysis
        </p>
      </div>
    </div>
  );
}