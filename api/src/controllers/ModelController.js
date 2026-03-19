import { Auth0Provider } from '@bcwdev/auth0provider'
import BaseController from '../utils/BaseController.js'
import { dbContext } from '../db/DbContext.js'

export class ModelController extends BaseController {
  constructor() {
    super('api/models')
    this.router
      .get('', this.getAllModels)
      .get('/:id', this.getModelById)
      // NOTE: Beyond this point all routes require Authorization Bearer token
      .use(Auth0Provider.getAuthorizedUserInfo)
      .post('', this.createModel)
      .put('/:id', this.updateModel)
      .delete('/:id', this.deleteModel)
  }

  async getAllModels(request, response, next) {
    try {
      const { category, search, limit = 20, skip = 0 } = request.query
      const filter = {}

      if (category) {
        filter.category = category
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      }

      const models = await dbContext.Model
        .find(filter)
        .populate('createdBy', 'name picture')
        .populate('partGroupings.parts.partId', 'name stlBlobUrl previewImageUrl isDefault')
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ createdAt: -1 })

      const total = await dbContext.Model.countDocuments(filter)

      response.send({ data: models, total, limit, skip })
    } catch (error) {
      next(error)
    }
  }

  async getModelById(request, response, next) {
    try {
      const model = await dbContext.Model
        .findById(request.params.id)
        .populate('createdBy', 'name picture')
        .populate('partGroupings.parts.partId')

      if (!model) {
        return response.status(404).send({ error: 'Model not found' })
      }

      response.send(model)
    } catch (error) {
      next(error)
    }
  }

  async createModel(request, response, next) {
    try {
      const { name, category, tags, price, defaultScale, description, partGroupings } = request.body

      if (!name || !category || price === undefined) {
        return response.status(400).send({ error: 'Missing required fields: name, category, price' })
      }

      const newModel = {
        name,
        category,
        tags: tags || [],
        price,
        defaultScale: defaultScale || 100,
        description,
        createdBy: request.userInfo.id,
        partGroupings: partGroupings || []
      }

      const model = await dbContext.Model.create(newModel)
      const populatedModel = await model
        .populate('createdBy', 'name picture')
        .populate('partGroupings.parts.partId')

      response.status(201).send(populatedModel)
    } catch (error) {
      next(error)
    }
  }

  async updateModel(request, response, next) {
    try {
      const { name, category, tags, price, defaultScale, description, partGroupings } = request.body

      const model = await dbContext.Model.findById(request.params.id)

      if (!model) {
        return response.status(404).send({ error: 'Model not found' })
      }

      if (name) model.name = name
      if (category) model.category = category
      if (tags) model.tags = tags
      if (price !== undefined) model.price = price
      if (defaultScale !== undefined) model.defaultScale = defaultScale
      if (description !== undefined) model.description = description
      if (partGroupings) model.partGroupings = partGroupings

      await model.save()
      const populatedModel = await model
        .populate('createdBy', 'name picture')
        .populate('partGroupings.parts.partId')

      response.send(populatedModel)
    } catch (error) {
      next(error)
    }
  }

  async deleteModel(request, response, next) {
    try {
      const model = await dbContext.Model.findById(request.params.id)

      if (!model) {
        return response.status(404).send({ error: 'Model not found' })
      }

      // Delete all associated parts
      await dbContext.Part.deleteMany({ modelId: model._id })

      // Delete all associated orders containing parts from this model
      await dbContext.Order.updateMany(
        {},
        { $pull: { items: { partId: { $in: model._id } } } }
      )

      await dbContext.Model.findByIdAndDelete(request.params.id)

      response.send({ message: 'Model deleted successfully' })
    } catch (error) {
      next(error)
    }
  }
}
