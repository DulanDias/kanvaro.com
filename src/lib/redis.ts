import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL
    if (!redisUrl) {
      throw new Error('Redis disabled: REDIS_URL not set')
    }

    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        connectTimeout: 300
      }
    })

    redisClient.on('error', (err) => {
    //  console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
    //  console.log('Connected to Redis')
    })

    const connectPromise = redisClient.connect()
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Redis connect timeout')), 350))
    await Promise.race([connectPromise, timeout])
  }

  return redisClient
}

export async function cache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  try {
    const client = await getRedisClient()
    
    // Try to get from cache
    const cached = await client.get(key)
    if (cached) {
      return JSON.parse(cached)
    }

    // Execute function and cache result
    const result = await fn()
    await client.setEx(key, ttl, JSON.stringify(result))
    
    return result
  } catch (error) {
    // console.error('Cache error:', error)
    // Fallback to direct execution if Redis fails
    return await fn()
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const client = await getRedisClient()
    const keys = await client.keys(pattern)
    
    if (keys.length > 0) {
      await client.del(keys)
    }
  } catch (error) {
    // console.error('Cache invalidation error:', error)
  }
}

export async function publishEvent(channel: string, data: any) {
  try {
    const client = await getRedisClient()
    await client.publish(channel, JSON.stringify(data))
  } catch (error) {
    // console.error('Publish error:', error)
  }
}

export async function subscribeToEvents(
  channels: string[],
  callback: (channel: string, data: any) => void
) {
  try {
    const client = await getRedisClient()
    
    for (const channel of channels) {
      await client.subscribe(channel, (message) => {
        try {
          const data = JSON.parse(message)
          callback(channel, data)
        } catch (error) {
          // console.error('Message parsing error:', error)
        }
      })
    }
  } catch (error) {
    // console.error('Subscribe error:', error)
  }
}
