import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  isDraft: boolean
  organization: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  teamMembers: mongoose.Types.ObjectId[]
  client?: mongoose.Types.ObjectId
  // Project-specific roles for team members
  projectRoles: {
    user: mongoose.Types.ObjectId
    role: 'project_manager' | 'project_member' | 'project_viewer' | 'project_client' | 'project_account_manager'
    assignedBy: mongoose.Types.ObjectId
    assignedAt: Date
  }[]
  startDate: Date
  endDate?: Date
  budget?: {
    total: number
    spent: number
    currency: string
    categories: {
      labor: number
      materials: number
      overhead: number
      external: number
    }
    lastUpdated: Date
    updatedBy: mongoose.Types.ObjectId
  }
  accountManager?: mongoose.Types.ObjectId
  settings: {
    allowTimeTracking: boolean
    allowManualTimeSubmission: boolean
    allowExpenseTracking: boolean
    requireApproval: boolean
    notifications: {
      taskUpdates: boolean
      budgetAlerts: boolean
      deadlineReminders: boolean
    }
  }
  tags: string[]
  customFields: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  description: String,
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  isDraft: { type: Boolean, default: false },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  // Project-specific roles
  projectRoles: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { 
      type: String, 
      enum: ['project_manager', 'project_member', 'project_viewer', 'project_client', 'project_account_manager'],
      required: true 
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedAt: { type: Date, default: Date.now }
  }],
  startDate: { type: Date, required: true },
  endDate: Date,
  budget: {
    total: Number,
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    categories: {
      labor: { type: Number, default: 0 },
      materials: { type: Number, default: 0 },
      overhead: { type: Number, default: 0 },
      external: { type: Number, default: 0 }
    },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  accountManager: { type: Schema.Types.ObjectId, ref: 'User' },
  settings: {
    allowTimeTracking: { type: Boolean, default: true },
    allowManualTimeSubmission: { type: Boolean, default: true },
    allowExpenseTracking: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    notifications: {
      taskUpdates: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true }
    }
  },
  tags: [{ type: String, trim: true }],
  customFields: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
})

// Indexes
ProjectSchema.index({ organization: 1, status: 1 })
ProjectSchema.index({ createdBy: 1 })
ProjectSchema.index({ teamMembers: 1 })
ProjectSchema.index({ startDate: 1, endDate: 1 })

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)
