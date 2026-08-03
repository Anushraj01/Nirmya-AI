import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { UserRole } from '../models/User'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        name: string
        email: string
        role: UserRole
      }
    }
  }
}

interface TokenPayload {
  id: string
  name: string
  email: string
  role: UserRole
}

const devBypassToken = 'local-dev-token'

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null

  if (process.env.NODE_ENV !== 'production' && token === devBypassToken) {
    req.user = {
      id: 'local-patient',
      name: 'Local Patient',
      email: 'patient@example.com',
      role: 'Patient',
    }
    next()
    return
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication token missing' })
    return
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired access token' })
  }
}

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication token missing' })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions' })
      return
    }

    next()
  }
}
