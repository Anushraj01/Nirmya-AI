import type { Request, Response, NextFunction } from 'express'
import { Appointment } from '../models/Appointment'

export const authorizePatientMedicalHistoryAccess = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token missing' })
    return
  }

  const patientId =
    (req.params.patientId as string | undefined) ||
    (typeof req.query.patientId === 'string' ? req.query.patientId : undefined) ||
    (typeof req.body?.patientId === 'string' ? req.body.patientId : undefined) ||
    req.user.id

  if (!patientId) {
    res.status(400).json({ success: false, message: 'Patient identifier is required' })
    return
  }

  if (req.user.role === 'Patient') {
    if (req.user.id !== patientId) {
      res.status(403).json({ success: false, message: 'You can only access your own medical history' })
      return
    }

    next()
    return
  }

  if (req.user.role === 'Doctor') {
    const hasActiveAppointment = await Appointment.exists({
      doctorId: req.user.id,
      patientId,
      status: { $in: ['confirmed', 'completed'] },
    })

    if (!hasActiveAppointment) {
      res.status(403).json({ success: false, message: 'You need an active appointment with this patient to view their medical history' })
      return
    }

    next()
    return
  }

  res.status(403).json({ success: false, message: 'Insufficient permissions' })
}
