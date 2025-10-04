import mongoose, { Schema, Document } from 'mongoose'

export interface ISprint extends Document {
  name: string
  description?: string
  project: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  startDate: Date
  endDate: Date
  actualStartDate?: Date
  actualEndDate?: Date
  goal?: string
  velocity?: number
  capacity: number // Total team capacity in hours
  stories: mongoose.Types.ObjectId[]
  tasks: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const SprintSchema = new Schema<ISprint>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualStartDate: Date,
  actualEndDate: Date,
  goal: {
    type: String,
    maxlength: 500
  },
  velocity: {
    type: Number,
    min: 0
  },
  capacity: {
    type: Number,
    required: true,
    min: 0
  },
  stories: [{
    type: Schema.Types.ObjectId,
    ref: 'Story'
  }],
  tasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
})

// Indexes
SprintSchema.index({ project: 1 })
SprintSchema.index({ createdBy: 1 })
SprintSchema.index({ status: 1 })
SprintSchema.index({ startDate: 1 })
SprintSchema.index({ endDate: 1 })
SprintSchema.index({ project: 1, status: 1 })

export const Sprint = mongoose.models.Sprint || mongoose.model<ISprint>('Sprint', SprintSchema)
