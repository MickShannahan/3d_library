import { modelsService } from "../services/ModelsService.js";
import BaseController from "../utils/BaseController.js";



export class ModelsController extends BaseController {
  constructor() {
    super('api/models')
    this.router
      .get('', this.getModels)
      .post('', this.createModel)
      .delete('/:modelId', this.deleteModel)
  }

  async createModel(req, res, next) {
    try {
      const body = req.body
      const model = await modelsService.createModel(body)
      res.send(model)
    } catch (error) {
      next(error)
    }
  }

  async getModels(req, res, next) {
    try {
      const query = req.query ?? {}
      const models = await modelsService.findModels(query)
      res.send(models)
    } catch (error) {
      next(error)
    }
  }

  async deleteModel(req, res, next) {
    try {
      const modelId = req.params.modelId
      const deleteMessage = await modelsService.deleteModel(modelId)
      res.send({ message: deleteMessage })
    } catch (error) {
      next(error)
    }
  }
}