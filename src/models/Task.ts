import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  project: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  epic?: mongoose.Types.ObjectId
  storyPoints?: number
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  dependencies: mongoose.Types.ObjectId[]
  attachments: {
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
  }[]
  comments: {
    user: mongoose.Types.ObjectId
    content: string
    createdAt: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true },
  description: String,
  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'review', 'done', 'cancelled'],
    default: 'todo'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  epic: { type: Schema.Types.ObjectId, ref: 'Epic' },
  storyPoints: Number,
  dueDate: Date,
  estimatedHours: Number,
  actualHours: { type: Number, default: 0 },
  tags: [String],
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

// Indexes
TaskSchema.index({ project: 1, status: 1 })
TaskSchema.index({ assignedTo: 1 })
TaskSchema.index({ createdBy: 1 })
TaskSchema.index({ dueDate: 1 })
TaskSchema.index({ tags: 1 })

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
