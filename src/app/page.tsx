'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database, Users, Settings, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkSetupStatus()
  }, [])

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/setup')
    }
  }, [shouldRedirect, router])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup/status')
      const data = await response.json()
      setIsSetupComplete(data.isSetupComplete)
      
      // Always redirect to setup if not complete
      if (!data.isSetupComplete) {
        setShouldRedirect(true)
      }
    } catch (error) {
      console.error('Failed to check setup status:', error)
      setIsSetupComplete(false)
      setShouldRedirect(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render anything if setup is not complete
  if (!isSetupComplete || shouldRedirect) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Kanvaro
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Your self-hosted project management solution is ready!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Database className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Database
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              MongoDB connection established and configured
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Admin User
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Administrator account created and ready
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <Settings className="h-8 w-8 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Organization
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Organization settings configured
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Service
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Email notifications configured
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
