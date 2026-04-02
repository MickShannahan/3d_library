import { dbContext } from "../db/DbContext.js"


class ModelsService {
  async createModel(modelData) {
    const model = await dbContext.Models.create(modelData)
    return model
  }
}


export const modelsService = new ModelsService()