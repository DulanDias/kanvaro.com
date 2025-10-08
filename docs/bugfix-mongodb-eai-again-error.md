# MongoDB EAI_AGAIN Error Fix

## Problem Description

When accessing certain endpoints (like `/api/setup/complete` or `/api/currencies`) during the setup flow, the application would throw a `getaddrinfo EAI_AGAIN` MongoDB error, even though the `/api/setup/database/create` endpoint worked fine.

Additionally, when running the application locally (outside Docker), the create endpoint would fail with `getaddrinfo ENOTFOUND mongodb` because it was incorrectly converting `localhost` to `mongodb` hostname.

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

### 1. Fixed Hostname Resolution for Local Development

**Files:** `src/app/api/setup/database/test/route.ts` and `src/app/api/setup/database/create/route.ts`

**Change:** Only convert `localhost` to `mongodb` when actually running inside Docker:

```typescript
// Before (BAD):
let host = config.host
if (config.host === 'localhost') {
  host = 'mongodb' // Always converted, breaks local development!
}

// After (GOOD):
let host = config.host
if (config.host === 'localhost' && process.env.DOCKER === 'true') {
  host = 'mongodb' // Only convert when running in Docker
}
```

**Why this matters:**
- The hostname `mongodb` only resolves inside Docker containers (via Docker's internal DNS)
- When running locally with `npm run dev`, you need to use `localhost` to connect to MongoDB
- The `DOCKER=true` environment variable is set in `docker-compose.yml` but not in local development

### 2. Fixed Test Endpoint to Use Isolated Connection

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

### 3. Simplified Connection Cache Handling

**File:** `src/lib/db-config.ts`

**Change:** Simplified the connection caching logic to be more robust:

```typescript
export async function connectDB() {
  // If we already have a connection, return it
  if (cached.conn) {
    return cached.conn
  }

  // If there's a pending connection promise, wait for it
  if (cached.promise) {
    try {
      cached.conn = await cached.promise
      return cached.conn
    } catch (e) {
      // If the pending promise failed, clear it and try again
      cached.promise = null
      // Fall through to create a new connection
    }
  }

  // Create new connection...
}
```

This ensures that:
- Existing connections are reused when available
- Failed connection promises are cleared and retried
- The cache is cleaned up properly on errors

### 4. Improved Error Handling

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

1. Clear any existing `config.json` file to start fresh
2. Start MongoDB: `docker compose up mongodb -d` (or ensure MongoDB is running on localhost:27017)
3. Start the application in dev mode: `npm run dev`
4. Go through the setup flow:
   - Test the database connection (calls `/api/setup/database/test`)
   - Create/configure the database (calls `/api/setup/database/create`)
   - Complete the setup (calls `/api/setup/complete`)
5. Verify currencies are loaded (calls `/api/currencies`)

All endpoints should now work without the `EAI_AGAIN` error.

### Debugging

If you encounter a 400 error, check the terminal/console logs for:
- "Creating new database connection to..." - indicates connection attempt
- "Database connection established successfully" - indicates success
- Any error messages with stack traces

Common issues:
- **MongoDB not running**: Ensure MongoDB is accessible on the configured host/port
- **Connection refused**: Check that MongoDB service is started
- **Authentication failed**: Verify username/password if using authentication
- **Config file issues**: Check that `config.json` is being saved correctly

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

