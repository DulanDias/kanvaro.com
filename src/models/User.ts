import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'admin' | 'project_manager' | 'team_member' | 'client' | 'viewer'
  organization: mongoose.Types.ObjectId
  isActive: boolean
  avatar?: string
  timezone: string
  language: string
  billingRate?: number
  currency: string
  lastLogin?: Date
  emailVerified: boolean
  twoFactorEnabled: boolean
  passwordResetOtp?: string
  passwordResetExpiry?: Date
  passwordResetToken?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    sidebarCollapsed: boolean
    notifications: {
      email: boolean
      inApp: boolean
      push: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'project_manager', 'team_member', 'client', 'viewer'],
    default: 'team_member'
  },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  isActive: { type: Boolean, default: true },
  avatar: String,
  timezone: { type: String, default: 'UTC' },
  language: { type: String, default: 'en' },
  billingRate: Number,
  currency: { type: String, default: 'USD' },
  lastLogin: Date,
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  passwordResetOtp: String,
  passwordResetExpiry: Date,
  passwordResetToken: String,
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    sidebarCollapsed: { type: Boolean, default: false },
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
})

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ organization: 1, role: 1 })
UserSchema.index({ isActive: 1 })

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
