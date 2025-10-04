import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { User } from '@/models/User'

export async function GET() {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      // Return mock user for demo purposes when DB is not configured
      const mockUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@kanvaro.com',
        role: 'admin',
        organization: '1',
        isActive: true,
        emailVerified: true,
        timezone: 'UTC',
        language: 'en',
        currency: 'USD',
        preferences: {
          theme: 'system',
          sidebarCollapsed: false,
          notifications: {
            email: true,
            inApp: true,
            push: false
          }
        }
      }
      return NextResponse.json(mockUser)
    }
    
    await connectDB()
    
    // For demo purposes, return a mock user
    // In a real app, this would check JWT tokens
    const mockUser = {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kanvaro.com',
      role: 'admin',
      organization: '1',
      isActive: true,
      emailVerified: true,
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      preferences: {
        theme: 'system',
        sidebarCollapsed: false,
        notifications: {
          email: true,
          inApp: true,
          push: false
        }
      }
    }
    
    return NextResponse.json(mockUser)
  } catch (error) {
    console.error('Auth check failed:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}
