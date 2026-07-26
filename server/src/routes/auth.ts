import crypto from 'crypto'
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { env } from '../config/env'
import { authenticateToken, requireRole } from '../middleware/auth'

const router = Router()

const signAccessToken = (user: { id: string; name: string; email: string; role: 'Patient' | 'Doctor' | 'Admin' }) => {
  return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: '15m',
  })
}

const signRefreshToken = (user: { id: string; name: string; email: string; role: 'Patient' | 'Doctor' | 'Admin' }) => {
  return jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, env.jwtRefreshSecret, {
    expiresIn: '7d',
  })
}

const setRefreshCookie = (res: any, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'Name, email, password and role are required' })
      return
    }

    const normalizedRole = role === 'Doctor' ? 'Doctor' : 'Patient'
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User already exists' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      approvalStatus: normalizedRole === 'Doctor' ? 'pending_approval' : 'approved',
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' })
      return
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' })
      return
    }

    if (user.role === 'Doctor' && user.approvalStatus === 'pending_approval') {
      res.status(403).json({ success: false, message: 'Account pending admin approval' })
      return
    }

    const accessToken = signAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })
    const refreshToken = signRefreshToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    setRefreshCookie(res, refreshToken)

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token missing' })
      return
    }

    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as {
      id: string
      name: string
      email: string
      role: 'Patient' | 'Doctor' | 'Admin'
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' })
      return
    }

    const accessToken = signAccessToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approvalStatus: user.approvalStatus,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' })
      return
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const resetToken = crypto.randomBytes(24).toString('hex')
    const hashedResetToken = await bcrypt.hash(resetToken, 10)

    user.passwordResetToken = hashedResetToken
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await user.save()

    console.log(`Password reset token for ${email}: ${resetToken}`)

    res.json({ success: true, message: 'Password reset token generated' })
  } catch (error) {
    next(error)
  }
})

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, token, password } = req.body

    if (!email || !token || !password) {
      res.status(400).json({ success: false, message: 'Email, token and password are required' })
      return
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    if (!user.passwordResetToken || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
      res.status(401).json({ success: false, message: 'Invalid or expired reset token' })
      return
    }

    const isValidResetToken = await bcrypt.compare(token, user.passwordResetToken)
    if (!isValidResetToken) {
      res.status(401).json({ success: false, message: 'Invalid or expired reset token' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.passwordResetToken = undefined
    user.passwordResetTokenExpiresAt = undefined
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    next(error)
  }
})

router.get('/profile', authenticateToken, requireRole(['Patient', 'Doctor', 'Admin']), (req, res) => {
  res.json({ success: true, user: req.user })
})

export default router
