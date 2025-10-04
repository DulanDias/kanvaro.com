import mongoose, { Schema, Document } from 'mongoose'

export interface IOrganization extends Document {
  name: string
  domain?: string
  logo?: string
  timezone: string
  currency: string
  language: string
  industry?: string
  size: 'startup' | 'small' | 'medium' | 'enterprise'
  settings: {
    allowSelfRegistration: boolean
    requireEmailVerification: boolean
    defaultUserRole: string
    projectTemplates: mongoose.Types.ObjectId[]
  }
  billing: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise'
    maxUsers: number
    maxProjects: number
    features: string[]
  }
  emailConfig?: {
    provider: 'smtp' | 'azure' | 'sendgrid' | 'mailgun'
    smtp?: {
      host: string
      port: number
      secure: boolean
      username: string
      password: string
      fromEmail: string
      fromName: string
    }
    azure?: {
      connectionString: string
      fromEmail: string
      fromName: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true, trim: true },
  domain: String,
  logo: String,
  timezone: { type: String, default: 'UTC' },
  currency: { type: String, default: 'USD' },
  language: { type: String, default: 'en' },
  industry: String,
  size: { 
    type: String, 
    enum: ['startup', 'small', 'medium', 'enterprise'],
    default: 'small'
  },
  settings: {
    allowSelfRegistration: { type: Boolean, default: false },
    requireEmailVerification: { type: Boolean, default: true },
    defaultUserRole: { type: String, default: 'team_member' },
    projectTemplates: [{ type: Schema.Types.ObjectId, ref: 'ProjectTemplate' }]
  },
  billing: {
    plan: { 
      type: String, 
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    maxUsers: { type: Number, default: 5 },
    maxProjects: { type: Number, default: 3 },
    features: [String]
  },
  emailConfig: {
    provider: { type: String, enum: ['smtp', 'azure', 'sendgrid', 'mailgun'] },
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      username: String,
      password: String,
      fromEmail: String,
      fromName: String
    },
    azure: {
      connectionString: String,
      fromEmail: String,
      fromName: String
    }
  }
}, {
  timestamps: true
})

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema)
