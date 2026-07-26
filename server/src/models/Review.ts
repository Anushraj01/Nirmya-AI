import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IReview extends Document {
  appointmentId: Types.ObjectId
  patientId: Types.ObjectId
  doctorId: Types.ObjectId
  rating: number
  comment: string
}

const reviewSchema = new Schema<IReview>({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, default: '' },
})

export const Review = mongoose.model<IReview>('Review', reviewSchema)
