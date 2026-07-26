import { Request, Response, NextFunction } from 'express'

interface ErrorWithStatus extends Error {
  statusCode?: number
}

export const errorHandler = (
  error: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.stack,
  })
}
