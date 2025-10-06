'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Loader2 } from 'lucide-react'

interface Member {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  customRole?: {
    _id: string
    name: string
  }
  isActive: boolean
}

interface CustomRole {
  _id: string
  name: string
  description: string
}

interface EditMemberModalProps {
  member: Member
  onClose: () => void
  onUpdate: (memberId: string, updates: any) => void
}

export function EditMemberModal({ member, onClose, onUpdate }: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    role: member.role,
    customRoleId: member.customRole?._id || '',
    isActive: member.isActive
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([])
  const [rolesLoading, setRolesLoading] = useState(true)

  useEffect(() => {
    fetchCustomRoles()
  }, [])

  const fetchCustomRoles = async () => {
    try {
      setRolesLoading(true)
      const response = await fetch('/api/roles')
      const data = await response.json()

      if (data.success) {
        // Filter out system roles and get only custom roles
        const customRolesData = data.data.filter((role: any) => !role.isSystem)
        setCustomRoles(customRolesData)
      }
    } catch (err) {
      console.error('Failed to fetch custom roles:', err)
    } finally {
      setRolesLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required')
      return
    }

    setLoading(true)
    try {
      // Update member basic info
      await onUpdate(member._id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        isActive: formData.isActive
      })

      // Update custom role if changed
      if (formData.customRoleId !== (member.customRole?._id || '')) {
        const response = await fetch(`/api/users/${member._id}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customRoleId: formData.customRoleId || null
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update custom role')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Team Member</CardTitle>
              <CardDescription>
                Update member information and permissions
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={member.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">System Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customRole">Custom Role (Optional)</Label>
              <Select 
                value={formData.customRoleId || '__NO_CUSTOM_ROLE__'} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, customRoleId: value === '__NO_CUSTOM_ROLE__' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a custom role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NO_CUSTOM_ROLE__">No custom role</SelectItem>
                  {rolesLoading ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading roles...
                    </SelectItem>
                  ) : (
                    customRoles.map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Custom roles provide additional permissions beyond the system role
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-gray-500">
                  {formData.isActive ? 'Member can access the system' : 'Member cannot access the system'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Member'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
