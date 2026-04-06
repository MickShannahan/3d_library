import { dbContext } from "../db/DbContext.js"


class ModelsService {
  async createModel(modelData) {
    return await dbContext.Models.findOneAndUpdate({ _id: modelData._id }, modelData, { upsert: true, new: true })
  }
}


export const modelsService = new ModelsService()