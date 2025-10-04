'use client';

import { Loader2 } from 'lucide-react';

interface ContentLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ContentLoader({ 
  message = 'Loading...', 
  size = 'md' 
}: ContentLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
