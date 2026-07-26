import { Router } from 'express'
import { authenticateToken, requireRole } from '../middleware/auth'
import { authorizePatientMedicalHistoryAccess } from '../middleware/medicalHistoryAccess'
import { uploadSingle, cloudinaryUpload } from '../middleware/upload'
import { MedicalHistory } from '../models/MedicalHistory'

const router = Router()

const normalizeStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

router.post(
  ['/medical-history', '/medical-history/:patientId'],
  authenticateToken,
  requireRole(['Patient', 'Doctor']),
  authorizePatientMedicalHistoryAccess,
  async (req, res, next) => {
    try {
      const patientId = (req.params.patientId as string | undefined) || req.user?.id

      if (!patientId) {
        res.status(400).json({ success: false, message: 'Patient identifier is required' })
        return
      }

      const payload = {
        patientId,
        conditions: normalizeStringList(req.body?.conditions),
        allergies: normalizeStringList(req.body?.allergies),
        medications: normalizeStringList(req.body?.medications),
        familyHistory: normalizeStringList(req.body?.familyHistory),
      }

      const medicalHistory = await MedicalHistory.findOneAndUpdate(
        { patientId },
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )

      res.json({
        success: true,
        message: 'Medical history saved successfully',
        data: medicalHistory,
      })
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  ['/medical-history', '/medical-history/:patientId'],
  authenticateToken,
  requireRole(['Patient', 'Doctor']),
  authorizePatientMedicalHistoryAccess,
  async (req, res, next) => {
    try {
      const patientId = (req.params.patientId as string | undefined) || req.user?.id

      if (!patientId) {
        res.status(400).json({ success: false, message: 'Patient identifier is required' })
        return
      }

      const medicalHistory = await MedicalHistory.findOne({ patientId })

      if (!medicalHistory) {
        res.json({
          success: true,
          message: 'Medical history not found',
          data: {
            patientId,
            conditions: [],
            allergies: [],
            medications: [],
            familyHistory: [],
            reportUrls: [],
          },
        })
        return
      }

      res.json({
        success: true,
        message: 'Medical history retrieved successfully',
        data: medicalHistory,
      })
    } catch (error) {
      next(error)
    }
  },
)

router.post(
  ['/medical-history/upload-report', '/medical-history/:patientId/upload-report'],
  authenticateToken,
  requireRole(['Patient', 'Doctor']),
  authorizePatientMedicalHistoryAccess,
  uploadSingle('report'),
  async (req, res, next) => {
    try {
      const patientId = (req.params.patientId as string | undefined) || req.user?.id

      if (!patientId) {
        res.status(400).json({ success: false, message: 'Patient identifier is required' })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({ success: false, message: 'A report file is required' })
        return
      }

      const uploadResult = await cloudinaryUpload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        folder: 'nirmya-ai/medical-reports',
      })

      let medicalHistory = await MedicalHistory.findOne({ patientId })
      if (!medicalHistory) {
        medicalHistory = await MedicalHistory.create({
          patientId,
          conditions: [],
          allergies: [],
          medications: [],
          familyHistory: [],
          reportUrls: [uploadResult.secure_url],
        })
      } else {
        medicalHistory.reportUrls = [...(medicalHistory.reportUrls || []), uploadResult.secure_url]
        await medicalHistory.save()
      }

      res.json({
        success: true,
        message: 'Report uploaded successfully',
        data: medicalHistory,
      })
    } catch (error) {
      next(error)
    }
  },
)

export default router
