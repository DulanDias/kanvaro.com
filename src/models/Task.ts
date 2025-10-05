import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'testing' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  type: 'bug' | 'feature' | 'improvement' | 'task' | 'subtask'
  organization: mongoose.Types.ObjectId
  project: mongoose.Types.ObjectId
  story?: mongoose.Types.ObjectId
  parentTask?: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  storyPoints?: number
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  sprint?: mongoose.Types.ObjectId
  startDate?: Date
  completedAt?: Date
  labels: string[]
  dependencies: mongoose.Types.ObjectId[]
  attachments: {
    name: string
    url: string
    size: number
    type: string
    uploadedBy: mongoose.Types.ObjectId
    uploadedAt: Date
  }[]
  comments: {
    content: string
    author: mongoose.Types.ObjectId
    createdAt: Date
    updatedAt: Date
  }[]
  archived: boolean
  position: number
  // Test management fields
  linkedTestCase?: mongoose.Types.ObjectId
  foundInVersion?: string
  testExecutionId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 2000
  },
  status: {
    type: String,
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'improvement', 'task', 'subtask'],
    default: 'task'
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  story: {
    type: Schema.Types.ObjectId,
    ref: 'Story'
  },
  parentTask: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storyPoints: {
    type: Number,
    min: 0
  },
  dueDate: Date,
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  position: {
    type: Number,
    default: 0
  },
  sprint: {
    type: Schema.Types.ObjectId,
    ref: 'Sprint'
  },
  startDate: Date,
  completedAt: Date,
  labels: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  dependencies: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    content: { type: String, required: true, maxlength: 1000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  archived: { type: Boolean, default: false },
  // Test management fields
  linkedTestCase: {
    type: Schema.Types.ObjectId,
    ref: 'TestCase'
  },
  foundInVersion: {
    type: String,
    trim: true,
    maxlength: 50
  },
  testExecutionId: {
    type: Schema.Types.ObjectId,
    ref: 'TestExecution'
  }
}, {
  timestamps: true
})

// Indexes
TaskSchema.index({ organization: 1 })
TaskSchema.index({ project: 1 })
TaskSchema.index({ story: 1 })
TaskSchema.index({ parentTask: 1 })
TaskSchema.index({ createdBy: 1 })
TaskSchema.index({ assignedTo: 1 })
TaskSchema.index({ sprint: 1 })
TaskSchema.index({ status: 1 })
TaskSchema.index({ priority: 1 })
TaskSchema.index({ type: 1 })
TaskSchema.index({ organization: 1, status: 1 })
TaskSchema.index({ project: 1, status: 1 })
TaskSchema.index({ sprint: 1, status: 1 })
TaskSchema.index({ assignedTo: 1, status: 1 })
TaskSchema.index({ organization: 1, assignedTo: 1 })
TaskSchema.index({ organization: 1, createdBy: 1 })
TaskSchema.index({ archived: 1 })
TaskSchema.index({ organization: 1, archived: 1 })
TaskSchema.index({ project: 1, archived: 1 })
TaskSchema.index({ project: 1, status: 1, position: 1 })
TaskSchema.index({ organization: 1, createdAt: -1 })
TaskSchema.index({ project: 1, status: 1, createdAt: -1 })
TaskSchema.index({ title: 'text', description: 'text' })

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
