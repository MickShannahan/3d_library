import BaseController from '../utils/BaseController.js'
import { sharpService } from '../services/SharpService.js'
import { uploadService } from '../services/UploadService.js'

export class ImagesController extends BaseController {
  constructor() {
    super('upload/images')
    this.router
      .post('', this.uploadImages)
      .post('/gif', this.uploadImagesToGif)
  }

  async uploadImages(req, res, next) {
    try {
      const urls = await uploadService.uploadFiles(req.files.images, {
        processor: (file) => sharpService.processImageToWebP(file),
        folder: req.query.folder
      })
      res.send(urls)
    } catch (error) {
      next(error)
    }
  }

  async uploadImagesToGif(req, res, next) {
    try {
      const imageName = req.query.imageName || req.files.images[0]?.name
      const url = await uploadService.uploadFileSequence(
        req.files.images,
        (images) => sharpService.processImageSequenceToGif(images, imageName),
        { folder: req.query.folder }
      )
      res.send({ url })
    } catch (error) {
      next(error)
    }
  }

}