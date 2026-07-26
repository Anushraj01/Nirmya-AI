import mongoose, { Schema, Document } from 'mongoose'

export type UserRole = 'Patient' | 'Doctor' | 'Admin'
export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  approvalStatus: ApprovalStatus
  passwordResetToken?: string
  passwordResetTokenExpiresAt?: Date
  createdAt: Date
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Patient', 'Doctor', 'Admin'], required: true },
  approvalStatus: {
    type: String,
    enum: ['pending_approval', 'approved', 'rejected'],
    default: function (this: IUser) {
      return this.role === 'Doctor' ? 'pending_approval' : 'approved'
    },
  },
  passwordResetToken: { type: String },
  passwordResetTokenExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
})

export const User = mongoose.model<IUser>('User', userSchema)
