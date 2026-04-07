import { dbContext } from "../db/DbContext.js"


class ModelsService {
  async createModel(modelData) {
    return await dbContext.Models.findOneAndUpdate({ _id: modelData._id }, modelData, { upsert: true, new: true })
  }

  async findModels(query = {}) {
    return await dbContext.Models.find(query).populate('author')
  }
}


export const modelsService = new ModelsService()