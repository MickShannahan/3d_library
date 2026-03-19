import { Auth0Provider } from '@bcwdev/auth0provider'
import BaseController from '../utils/BaseController.js'
import { azureBlobService } from '../utils/AzureBlobService.js'

export class BlobController extends BaseController {
  constructor() {
    super('api/auth')
    this.router
      // NOTE: All routes require Authorization Bearer token
      .use(Auth0Provider.getAuthorizedUserInfo)
      .get('/blob-sas-token', this.getBlobSasToken)
  }

  async getBlobSasToken(request, response, next) {
    try {
      const { containerName = 'uploads', expiryMinutes = 30 } = request.query

      if (!containerName) {
        return response.status(400).send({
          error: 'Missing containerName query parameter'
        })
      }

      const sasUrl = await azureBlobService.generateSasToken(containerName, parseInt(expiryMinutes))

      response.send({
        sasUrl,
        containerName,
        expiresIn: expiryMinutes
      })
    } catch (error) {
      next(error)
    }
  }
}
