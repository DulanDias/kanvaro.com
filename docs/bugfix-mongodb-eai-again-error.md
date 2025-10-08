# MongoDB EAI_AGAIN Error Fix

## Problem Description

When accessing certain endpoints (like `/api/setup/complete` or `/api/currencies`) during the setup flow, the application would throw a `getaddrinfo EAI_AGAIN` MongoDB error, even though the `/api/setup/database/create` endpoint worked fine.

## Root Cause

The issue was caused by **global mongoose connection state corruption** in the database test endpoint:

### The Bug Flow

1. **User tests database connection** → calls `/api/setup/database/test`
2. **Test endpoint** creates a direct mongoose connection using `mongoose.connect()`
3. **Test completes** → endpoint calls `mongoose.disconnect()` to clean up
4. **Problem:** `mongoose.disconnect()` disconnects the **global singleton mongoose instance**
5. **This affects the cached connection** in `db-config.ts` which uses the same global mongoose instance
6. **When other endpoints call `connectDB()`**, the cached connection is stale/disconnected
7. **Result:** DNS resolution fails with `EAI_AGAIN` error because the connection is in an invalid state

### Why `/api/setup/database/create` Worked

The create endpoint worked because:
- It saved the database config first
- Then connected using `connectDB()`, establishing a **fresh cached connection**
- **It never disconnected**, so the cache remained valid

### Why Other Endpoints Failed

Other endpoints (like `/api/setup/complete` and `/api/currencies`):
- Assumed the cached connection from the create step was still valid
- But the **test endpoint had disconnected** the global mongoose instance
- The cache check in `connectDB()` didn't verify if the connection was still alive
- Resulted in attempts to use a stale/disconnected connection

## The Fix

### 1. Fixed Test Endpoint to Use Isolated Connection

**File:** `src/app/api/setup/database/test/route.ts`

**Change:** Created a **new mongoose instance** specifically for testing, instead of using the global singleton:

```typescript
// Before (BAD):
await mongoose.connect(uri, opts)
await mongoose.disconnect() // This breaks the global connection!

// After (GOOD):
const testMongoose = new mongoose.Mongoose() // Isolated instance
await testMongoose.connect(uri, opts)
await testMongoose.disconnect() // Only affects this instance
```

This ensures the test endpoint doesn't interfere with the cached global connection used by other endpoints.

### 2. Enhanced Connection Cache Validation

**File:** `src/lib/db-config.ts`

**Change:** Added connection state validation before reusing cached connections:

```typescript
if (cached.conn) {
  // Check if connection is still valid
  const state = mongoose.connection.readyState
  // 1 = connected, 2 = connecting
  if (state === 1 || state === 2) {
    return cached.conn
  } else {
    // Connection is stale, clear cache and reconnect
    cached.conn = null
    cached.promise = null
  }
}
```

This ensures that if the cached connection is disconnected or in an invalid state, it's cleared and a fresh connection is established.

### 3. Improved Error Handling

**File:** `src/lib/db-config.ts`

**Change:** Clear both cache and promise on connection errors:

```typescript
catch (e) {
  // Clear both cache and promise on error
  cached.promise = null
  cached.conn = null
  throw e
}
```

This prevents the cache from holding onto failed connection attempts.

## Connection States

Mongoose connection states:
- `0` = disconnected
- `1` = connected
- `2` = connecting
- `3` = disconnecting

The fix ensures we only reuse connections in states 1 (connected) or 2 (connecting).

## Testing the Fix

To verify the fix works:

1. Go through the setup flow
2. Test the database connection (calls `/api/setup/database/test`)
3. Complete the setup (calls `/api/setup/complete`)
4. Verify currencies are loaded (calls `/api/currencies`)

All endpoints should now work without the `EAI_AGAIN` error.

## Key Learnings

1. **Never use the global mongoose instance for temporary connections** - Always create a new `mongoose.Mongoose()` instance for isolated operations
2. **Always validate cached connections** before reusing them - Check the connection state
3. **Clean up cache on errors** - Clear both `promise` and `conn` to prevent stale state
4. **Be aware of mongoose's singleton pattern** - `mongoose.connect()` and `mongoose.disconnect()` affect the global instance used throughout the application

## Related Files

- `src/app/api/setup/database/test/route.ts` - Fixed to use isolated mongoose instance
- `src/lib/db-config.ts` - Enhanced connection caching and validation
- `src/app/api/setup/database/create/route.ts` - Works correctly (no changes needed)
- `src/app/api/setup/complete/route.ts` - Now works due to fixed cache
- `src/app/api/currencies/route.ts` - Now works due to fixed cache

## Prevention

To prevent similar issues in the future:

1. **Always use `connectDB()` from `db-config.ts`** for database operations in API routes
2. **Never call `mongoose.disconnect()`** in API routes unless absolutely necessary
3. **If temporary connections are needed**, always create isolated mongoose instances: `new mongoose.Mongoose()`
4. **Test the full flow** after making database connection changes

