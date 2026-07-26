import mongoose, { Schema, Document, Types } from 'mongoose'
import { IUser } from './User'

export interface IMedicalHistory extends Document {
  patientId: Types.ObjectId | IUser
  conditions: string[]
  allergies: string[]
  medications: string[]
  familyHistory: string[]
  reportUrls: string[]
}

const medicalHistorySchema = new Schema<IMedicalHistory>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conditions: { type: [String], default: [] },
  allergies: { type: [String], default: [] },
  medications: { type: [String], default: [] },
  familyHistory: { type: [String], default: [] },
  reportUrls: { type: [String], default: [] },
})

export const MedicalHistory = mongoose.model<IMedicalHistory>('MedicalHistory', medicalHistorySchema)
