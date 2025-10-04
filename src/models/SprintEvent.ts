import mongoose, { Schema, Document } from 'mongoose'

export interface ISprintEvent extends Document {
  sprint: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId
  eventType: 'planning' | 'review' | 'retrospective' | 'daily_standup' | 'demo' | 'other'
  title: string
  description?: string
  scheduledDate: Date
  actualDate?: Date
  duration: number // Duration in minutes
  attendees: mongoose.Types.ObjectId[]
  facilitator: mongoose.Types.ObjectId
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  outcomes?: {
    decisions: string[]
    actionItems: {
      description: string
      assignedTo: mongoose.Types.ObjectId
      dueDate: Date
      status: 'pending' | 'in_progress' | 'completed'
    }[]
    notes: string
    velocity?: number
    capacity?: number
  }
  location?: string
  meetingLink?: string
  createdAt: Date
  updatedAt: Date
}

const SprintEventSchema = new Schema<ISprintEvent>({
  sprint: {
    type: Schema.Types.ObjectId,
    ref: 'Sprint',
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  eventType: {
    type: String,
    enum: ['planning', 'review', 'retrospective', 'daily_standup', 'demo', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  actualDate: Date,
  duration: {
    type: Number,
    required: true,
    min: 15, // Minimum 15 minutes
    max: 480 // Maximum 8 hours
  },
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  facilitator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  outcomes: {
    decisions: [String],
    actionItems: [{
      description: { type: String, required: true },
      assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      dueDate: { type: Date, required: true },
      status: { 
        type: String, 
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      }
    }],
    notes: String,
    velocity: Number,
    capacity: Number
  },
  location: {
    type: String,
    maxlength: 200
  },
  meetingLink: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
})

// Indexes
SprintEventSchema.index({ sprint: 1, eventType: 1 })
SprintEventSchema.index({ project: 1, scheduledDate: 1 })
SprintEventSchema.index({ facilitator: 1 })
SprintEventSchema.index({ status: 1 })
SprintEventSchema.index({ scheduledDate: 1 })

export const SprintEvent = mongoose.models.SprintEvent || mongoose.model<ISprintEvent>('SprintEvent', SprintEventSchema)
