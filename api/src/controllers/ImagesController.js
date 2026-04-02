import BaseController from '../utils/BaseController.js'
import { sharpService } from '../services/SharpService.js'
import { azureService } from '../services/AzureService.js'

export class ImagesController extends BaseController {
  constructor() {
    super('upload/images')
    this.router
      .post('', this.uploadImages)
      .post('/gif', this.uploadImagesToGif)
  }

  async uploadImages(req, res, next) {
    try {
      const images = req.files.images
      const processImages = []
      for (let image of images) {
        const processed = await sharpService.processImageToWebP(image)
        processImages.push(processed)
      }
      const uploadedUrls = await azureService.uploadBulkFiles(processImages)
      res.send(uploadedUrls)
    } catch (error) {
      next(error)
    }
  }

  async uploadImagesToGif(req, res, next) {
    try {
      const images = req.files.images
      const imageName = req.params.imageName
      const processed = await sharpService.processImageSequenceToGif(images)
      const url = await azureService.uploadFile(processed)
      res.send({ url })
    } catch (error) {
      next(error)
    }
  }

}