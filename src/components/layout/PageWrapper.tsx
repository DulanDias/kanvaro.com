'use client';

import { usePermissionContext } from '@/lib/permissions/permission-context';
import { ContentLoader } from '@/components/ui/ContentLoader';

interface PageWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PageWrapper({ children, fallback }: PageWrapperProps) {
  const { loading, error } = usePermissionContext();

  if (loading) {
    return <ContentLoader message="Loading permissions..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-sm text-destructive">Failed to load permissions</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
