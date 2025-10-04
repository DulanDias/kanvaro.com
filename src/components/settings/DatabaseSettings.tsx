'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Database, TestTube, AlertCircle, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DatabaseSettings() {
  const [testing, setTesting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [formData, setFormData] = useState({
    host: 'localhost',
    port: 27017,
    database: 'kanvaro',
    username: '',
    password: '',
    authSource: 'admin',
    ssl: false
  })

  // Load existing database configuration
  useEffect(() => {
    const loadDatabaseConfig = async () => {
      try {
        const response = await fetch('/api/settings/database')
        if (response.ok) {
          const config = await response.json()
          setFormData({
            host: config.host || 'localhost',
            port: config.port || 27017,
            database: config.database || 'kanvaro',
            username: config.username || '',
            password: config.password || '',
            authSource: config.authSource || 'admin',
            ssl: config.ssl || false
          })
        }
      } catch (error) {
        console.error('Failed to load database configuration:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDatabaseConfig()
  }, [])

  const handleTest = async () => {
    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/setup/database/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Database connection test failed')
      }

      setMessage({ type: 'success', text: 'Database connection successful!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to database. Please check your configuration.' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setTesting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings/database', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update database settings')
      }

      setMessage({ type: 'success', text: 'Database settings updated successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update database settings' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Configuration
          </CardTitle>
          <CardDescription>
            Configure your MongoDB database connection settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="db-host">Host</Label>
              <Input
                id="db-host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="localhost"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-port">Port</Label>
              <Input
                id="db-port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 27017 })}
                placeholder="27017"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-database">Database Name</Label>
              <Input
                id="db-database"
                value={formData.database}
                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                placeholder="kanvaro"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-auth-source">Authentication Database</Label>
              <Input
                id="db-auth-source"
                value={formData.authSource}
                onChange={(e) => setFormData({ ...formData, authSource: e.target.value })}
                placeholder="admin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-username">Username</Label>
              <Input
                id="db-username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="mongodb_user"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="db-password">Password</Label>
              <Input
                id="db-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="db-ssl"
              checked={formData.ssl}
              onCheckedChange={(checked) => setFormData({ ...formData, ssl: checked })}
            />
            <Label htmlFor="db-ssl">Use SSL/TLS</Label>
          </div>

          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button 
              onClick={handleTest} 
              disabled={testing}
              variant="outline"
              className="flex items-center gap-2"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>

            <Button onClick={handleSave} disabled={testing} className="flex items-center gap-2">
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Database className="h-4 w-4" />
              )}
              {testing ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
