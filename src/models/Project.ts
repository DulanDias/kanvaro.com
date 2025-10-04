import mongoose, { Schema, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  description: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  organization: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  teamMembers: mongoose.Types.ObjectId[]
  client?: mongoose.Types.ObjectId
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
    }
  }
  settings: {
    allowTimeTracking: boolean
    allowExpenseTracking: boolean
    requireApproval: boolean
    notifications: {
      taskUpdates: boolean
      budgetAlerts: boolean
      deadlineReminders: boolean
    }
  }
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
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  client: { type: Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date, required: true },
  endDate: Date,
  budget: {
    total: Number,
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    categories: {
      labor: { type: Number, default: 0 },
      materials: { type: Number, default: 0 },
      overhead: { type: Number, default: 0 }
    }
  },
  settings: {
    allowTimeTracking: { type: Boolean, default: true },
    allowExpenseTracking: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    notifications: {
      taskUpdates: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
})

// Indexes
ProjectSchema.index({ organization: 1, status: 1 })
ProjectSchema.index({ createdBy: 1 })
ProjectSchema.index({ teamMembers: 1 })
ProjectSchema.index({ startDate: 1, endDate: 1 })

export const Project = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema)
