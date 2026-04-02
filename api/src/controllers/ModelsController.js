import { modelsService } from "../services/ModelsService.js";
import BaseController from "../utils/BaseController.js";



export class ModelsController extends BaseController {
  constructor() {
    super('api/models')
    this.router
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
}