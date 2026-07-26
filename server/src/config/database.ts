import mongoose from 'mongoose'
import { env } from './env'

export const connectDatabase = async () => {
  if (!env.mongoUri) {
    console.warn('MongoDB URI is not configured. Skipping database connection.')
    return
  }

  mongoose.set('strictQuery', true)

  mongoose.connection.on('connecting', () => {
    console.log('MongoDB: connecting...')
  })

  mongoose.connection.on('connected', () => {
    console.log('MongoDB: connected')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB: reconnected')
  })

  mongoose.connection.on('disconnecting', () => {
    console.log('MongoDB: disconnecting...')
  })

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB: disconnected')
  })

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB error:', error)
  })

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10000,
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error)
  }
}
