import mongoose from 'mongoose'
import connectDB from './db'
import { getDatabaseConfig as getConfigFromFile, getMongoUri } from './config'

let cachedConnection: any = null

/**
 * Get database configuration from the config file
 */
export async function getDatabaseConfig() {
  try {
    const config = getConfigFromFile()
    
    if (!config) {
      throw new Error('Database configuration not found. Please complete the setup process.')
    }

    return config
  } catch (error) {
    console.error('Failed to get database configuration:', error)
    throw error
  }
}

/**
 * Connect to the database using the stored configuration
 */
export async function connectWithStoredConfig() {
  try {
    // If we already have a connection, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return cachedConnection
    }

    const mongoUri = getMongoUri()
    if (!mongoUri) {
      throw new Error('No database URI found in configuration')
    }

    console.log('Connecting to database with stored configuration')

    // Disconnect any existing connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    // Connect using the stored URI
    const connection = await mongoose.connect(mongoUri, {
      bufferCommands: false,
    })

    cachedConnection = connection
    console.log('Successfully connected to database using stored configuration')
    
    return connection
  } catch (error) {
    console.error('Failed to connect with stored configuration:', error)
    throw error
  }
}

/**
 * Check if database configuration exists
 */
export async function hasDatabaseConfig(): Promise<boolean> {
  try {
    const config = getConfigFromFile()
    return !!(config)
  } catch (error) {
    console.error('Failed to check database configuration:', error)
    return false
  }
}
