import { NotFound, Forbidden } from '../utils/Errors.js'
import { dbContext } from "../db/DbContext.js"
import { azureService } from "./AzureService.js"


class ModelsService {

  async createOrUpdateModel(modelData = {}) {
    return await dbContext.Models.findOneAndUpdate({ _id: modelData._id }, modelData, { upsert: true, new: true })
  }

  async findModels(query = {}) {
    return await dbContext.Models.find(query).populate('author')
  }

  async findModelById(modelId = '') {
    const model = await dbContext.Models.findById(modelId).populate('author')
    if (!model) throw new NotFound(`No model with id: ${modelId}`)
    return model
  }

  async deleteModel(modelId = '') {
    const model = await dbContext.Models.findById(modelId)
    if (!model) throw new NotFound(`No Model with id: ${modelId}`)

    const urls = [
      model.coverImage,
      model.turnAroundImage,
      ...model.images,
      ...model.meshes.map(m => m.src),
      ...model.meshes.flatMap(m => m.images.map(img => img.data))
    ].filter(url => url)

    await azureService.deleteBulkFiles(urls)
    await model.deleteOne()
    return `${model.name} was deleted`
  }
}


export const modelsService = new ModelsService()