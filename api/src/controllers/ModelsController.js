import { modelsService } from "../services/ModelsService.js";
import BaseController from "../utils/BaseController.js";



export class ModelsController extends BaseController {
  constructor() {
    super('api/models')
    this.router
      .get('', this.getModels)
      .post('', this.createModel)
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
}