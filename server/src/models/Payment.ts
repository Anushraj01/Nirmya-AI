import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPayment extends Document {
  appointmentId: Types.ObjectId
  razorpayOrderId: string
  razorpayPaymentId: string
  amount: number
  priorityFee: number
  status: string
}

const paymentSchema = new Schema<IPayment>({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  amount: { type: Number, required: true },
  priorityFee: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
})

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema)
