import { Forbidden, NotFound } from "@bcwdev/auth0provider/lib/Errors.js"
import { dbContext } from "../db/DbContext.js"


class ModelsService {
  async createModel(modelData = {}) {
    return await dbContext.Models.findOneAndUpdate({ _id: modelData._id }, modelData, { upsert: true, new: true })
  }

  async findModels(query = {}) {
    return await dbContext.Models.find(query).populate('author')
  }

  async deleteModel(modelId = '') {
    const model = await dbContext.Models.findById(modelId)
    if (!model) throw new NotFound(`No Model with id: ${modelId}`)

    await model.deleteOne()
    return `${model.name} was deleted`
  }
}


export const modelsService = new ModelsService()