import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAppointment extends Document {
  patientId: Types.ObjectId
  doctorId: Types.ObjectId
  date: Date
  timeSlot: string
  type: 'routine' | 'emergency'
  tier: 'critical' | 'urgent' | 'routine'
  status: 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'
  prescription: string
  rating: number
  symptomSummary: string
}

const appointmentSchema = new Schema<IAppointment>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, enum: ['routine', 'emergency'], required: true },
  tier: { type: String, enum: ['critical', 'urgent', 'routine'], required: true },
  status: {
    type: String,
    enum: ['pending_payment', 'confirmed', 'completed', 'cancelled'],
    default: 'pending_payment',
  },
  prescription: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  symptomSummary: { type: String, default: '' },
})

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema)
