import { Auth0Provider } from '@bcwdev/auth0provider'
import BaseController from '../utils/BaseController.js'
import { dbContext } from '../db/DbContext.js'

export class PartController extends BaseController {
  constructor() {
    super('api/parts')
    this.router
      .get('/:id', this.getPartById)
      // NOTE: Beyond this point all routes require Authorization Bearer token
      .use(Auth0Provider.getAuthorizedUserInfo)
      .post('', this.createPart)
      .delete('/:id', this.deletePart)
  }

  async getPartById(request, response, next) {
    try {
      const part = await dbContext.Part
        .findById(request.params.id)
        .populate('modelId', 'name category price')

      if (!part) {
        return response.status(404).send({ error: 'Part not found' })
      }

      response.send(part)
    } catch (error) {
      next(error)
    }
  }

  async createPart(request, response, next) {
    try {
      const { modelId, name, stlBlobUrl, previewImageUrl, isDefault } = request.body

      if (!modelId || !name || !stlBlobUrl || !previewImageUrl) {
        return response.status(400).send({
          error: 'Missing required fields: modelId, name, stlBlobUrl, previewImageUrl'
        })
      }

      // Verify model exists
      const model = await dbContext.Model.findById(modelId)
      if (!model) {
        return response.status(404).send({ error: 'Model not found' })
      }

      const newPart = {
        modelId,
        name,
        stlBlobUrl,
        previewImageUrl,
        isDefault: isDefault || false
      }

      const part = await dbContext.Part.create(newPart)
      const populatedPart = await part.populate('modelId', 'name category price')

      response.status(201).send(populatedPart)
    } catch (error) {
      next(error)
    }
  }

  async deletePart(request, response, next) {
    try {
      const part = await dbContext.Part.findById(request.params.id)

      if (!part) {
        return response.status(404).send({ error: 'Part not found' })
      }

      // Check if part is referenced in any active orders
      const orderCount = await dbContext.Order.countDocuments({
        'items.partId': part._id
      })

      if (orderCount > 0) {
        return response.status(400).send({
          error: 'Cannot delete part: it is referenced in active orders'
        })
      }

      await dbContext.Part.findByIdAndDelete(request.params.id)

      response.send({ message: 'Part deleted successfully' })
    } catch (error) {
      next(error)
    }
  }
}
