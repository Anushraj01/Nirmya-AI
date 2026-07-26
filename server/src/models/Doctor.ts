import mongoose, { Schema, Document, Types } from 'mongoose'
import { IUser } from './User'

export interface IDoctor extends Document {
  userId: Types.ObjectId | IUser
  specialty: string
  experience: number
  fees: number
  rating: number
  bio: string
  qualifications: string[]
  availability: string[]
  isEmergencyOnCall: boolean
}

const doctorSchema = new Schema<IDoctor>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  specialty: { type: String, required: true },
  experience: { type: Number, required: true },
  fees: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  qualifications: { type: [String], default: [] },
  availability: { type: [String], default: [] },
  isEmergencyOnCall: { type: Boolean, default: false },
})

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema)
