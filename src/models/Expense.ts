import mongoose, { Schema, Document } from 'mongoose'

export interface IExpense extends Document {
  description: string
  amount: number
  currency: string
  category: string
  vendor?: string
  date: Date
  project: mongoose.Types.ObjectId
  organization: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  attachments: {
    name: string
    url: string
    size: number
    type: string
    uploadedBy: mongoose.Types.ObjectId
    uploadedAt: Date
  }[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const ExpenseSchema = new Schema<IExpense>({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  vendor: {
    type: String,
    trim: true,
    maxlength: 100
  },
  date: {
    type: Date,
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }]
}, {
  timestamps: true
})

// Indexes
ExpenseSchema.index({ organization: 1 })
ExpenseSchema.index({ project: 1 })
ExpenseSchema.index({ createdBy: 1 })
ExpenseSchema.index({ status: 1 })
ExpenseSchema.index({ category: 1 })
ExpenseSchema.index({ date: 1 })
ExpenseSchema.index({ organization: 1, project: 1 })
ExpenseSchema.index({ organization: 1, status: 1 })
ExpenseSchema.index({ project: 1, status: 1 })

export const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema)
