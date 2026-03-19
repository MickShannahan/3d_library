import mongoose from 'mongoose'
import { logger } from '../utils/Logger.js'
import dns from 'node:dns/promises';
dns.setServers(['1.1.1.1', '8.8.8.8']);


mongoose.connection.on('error', err => {
  logger.error('[DATABASE ERROR]:', err)
})
mongoose.connection.on('connection', () => {
  logger.log('DbConnection Successful')
})

mongoose.set('strictQuery', false)

export class DbConnection {
  static async connect(connectionstring = process.env.CONNECTION_STRING || '') {
    const status = 0
    try {
      if (!connectionstring) {
        return logger.warn('Db not available, no CONNECTION_STRING')
      }
      logger.info('connecting...', connectionstring)
      const status = await mongoose.connect(connectionstring)
      logger.info('[CONNECTION TO DB SUCCESSFUL]')
      return status
    } catch (e) {
      logger.error(
        '[MONGOOSE CONNECTION ERROR]:',
        'Invalid connection string'
      )
      return status
    }
  }
}
