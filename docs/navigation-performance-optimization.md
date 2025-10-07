---
slug: "reference/navigation-performance-optimization"
title: "Navigation Performance Optimization"
summary: "Performance optimization strategies for navigation, routing, and page loading with caching and lazy loading techniques."
visibility: "public"
audiences: ["admin", "self_host_admin"]
category: "reference"
order: 40
updated: "2025-01-04"
---

# Navigation Performance Optimization

## Problem Analysis

The sidebar navigation was experiencing significant delays due to several performance bottlenecks:

1. **Permission System Blocking**: `PermissionGate` components were blocking navigation until permissions loaded
2. **Repeated API Calls**: Organization and permission data were fetched on every navigation
3. **Synchronous Permission Checks**: Permission validation was blocking the UI thread
4. **No Caching**: Data was refetched unnecessarily

## Implemented Optimizations

### 1. Non-Blocking Permission Gates

**Before**: Permission gates blocked navigation until permissions loaded
```tsx
// OLD - Blocking behavior
if (!permissions) return false; // This blocked navigation
```

**After**: Permission gates allow navigation during loading
```tsx
// NEW - Non-blocking behavior
if (loading) {
  return <>{children}</>; // Show content immediately during loading
}
```

### 2. Optimized Permission Context

**Before**: Permissions fetched on every app load
```tsx
// OLD - No caching
const fetchPermissions = async () => {
  const response = await fetch('/api/auth/permissions');
  // ... fetch every time
}
```

**After**: Cached permissions with 5-minute expiration
```tsx
// NEW - Cached with expiration
let permissionsCache: UserPermissions | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Use cached data if available and not expired
if (permissionsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
  setPermissions(permissionsCache);
  setLoading(false);
  return;
}
```

### 3. Organization Data Caching

**Before**: Organization data fetched on every sidebar render
```tsx
// OLD - No caching
useEffect(() => {
  fetchOrganization(); // Called every time
}, []);
```

**After**: Cached organization data
```tsx
// NEW - Cached organization data
let organizationCache: Organization | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Use cached data if available and not expired
if (organizationCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
  setOrganization(organizationCache);
  setLoading(false);
  return;
}
```

### 4. Non-Blocking Navigation

**Before**: Synchronous navigation
```tsx
// OLD - Blocking navigation
onClick={() => {
  router.push(item.path); // Blocking call
}}
```

**After**: Non-blocking navigation with React's startTransition
```tsx
// NEW - Non-blocking navigation
onClick={() => {
  startTransition(() => {
    router.push(item.path); // Non-blocking call
  });
}}
```

### 5. Optimized Permission Checks

**Before**: Permission checks blocked navigation
```tsx
// OLD - Blocking permission checks
if (!permissions) return false; // This blocked navigation
```

**After**: Permission checks allow navigation during loading
```tsx
// NEW - Non-blocking permission checks
if (!permissions) return true; // Allow navigation during loading
```

## Performance Improvements

### Navigation Speed
- **Before**: 2-3 second delay before URL updates
- **After**: Instant URL updates with immediate navigation

### API Calls Reduction
- **Before**: 2-3 API calls per navigation (organization + permissions)
- **After**: 0 API calls for cached data (5-minute cache)

### User Experience
- **Before**: Sidebar items appeared to be "frozen" during navigation
- **After**: Smooth, responsive navigation with immediate feedback

## Implementation Details

### 1. Permission Gate Optimization
```tsx
export function PermissionGate({ permission, projectId, fallback = null, children }: PermissionGateProps) {
  const { hasPermission, loading } = usePermissions();
  
  // Show children immediately if permissions are still loading to prevent blocking
  if (loading) {
    return <>{children}</>;
  }
  
  if (hasPermission(permission, projectId)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
```

### 2. Caching Strategy
```tsx
// Cache with expiration
let permissionsCache: UserPermissions | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Check cache validity
if (permissionsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
  // Use cached data
  return cachedData;
}
```

### 3. Non-Blocking Navigation
```tsx
import { startTransition } from 'react';

onClick={() => {
  startTransition(() => {
    router.push(item.path);
  });
}}
```

## Best Practices

### 1. Always Use Caching
- Cache API responses with reasonable expiration times
- Use cache-first strategy for non-critical data
- Implement cache invalidation for critical updates

### 2. Non-Blocking UI
- Use `startTransition` for navigation
- Show content immediately during loading states
- Avoid blocking permission checks

### 3. Optimize Permission System
- Allow navigation during permission loading
- Cache permission data
- Use optimistic permission checks

### 4. Monitor Performance
- Track navigation timing
- Monitor API call frequency
- Measure user experience metrics

## Testing the Optimizations

### Before Optimization
1. Click sidebar item
2. Wait 2-3 seconds for URL to update
3. Wait additional time for content to load
4. Notice sidebar appears "frozen"

### After Optimization
1. Click sidebar item
2. URL updates immediately
3. Content loads smoothly
4. Sidebar remains responsive

## Additional Recommendations

### 1. Preloading
Consider preloading critical routes:
```tsx
// Preload critical routes
useEffect(() => {
  router.prefetch('/dashboard');
  router.prefetch('/projects');
}, []);
```

### 2. Route Optimization
Use Next.js dynamic imports for code splitting:
```tsx
const DashboardPage = dynamic(() => import('./DashboardPage'), {
  loading: () => <ContentLoader message="Loading dashboard..." />
});
```

### 3. API Optimization
Implement API response caching:
```tsx
// Add cache headers to API responses
res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
```

## Conclusion

These optimizations significantly improve navigation performance by:

1. **Eliminating blocking operations** during navigation
2. **Reducing API calls** through intelligent caching
3. **Providing immediate feedback** to users
4. **Maintaining responsive UI** during data loading

The result is a smooth, professional navigation experience that feels instant and responsive.
