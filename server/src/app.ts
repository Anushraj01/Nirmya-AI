import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { connectDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is healthy', data: { name: 'Nirmya AI' } })
})

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`) as Error & { statusCode?: number }
  error.statusCode = 404
  next(error)
})

app.use(errorHandler)

export const startServer = async () => {
  await connectDatabase()
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`)
  })
}

export default app
