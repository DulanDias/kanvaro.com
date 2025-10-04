'use client';

import { usePermissionContext } from '@/lib/permissions/permission-context';
import { Loader2 } from 'lucide-react';

interface PermissionLoaderProps {
  children: React.ReactNode;
}

export function PermissionLoader({ children }: PermissionLoaderProps) {
  const { loading } = usePermissionContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
