import BaseController from "../utils/BaseController.js";
import { uploadService } from "../services/UploadService.js";
import { azureService } from "../services/AzureService.js";
import { modelsService } from "../services/ModelsService.js";
import { socketProvider } from "../SocketProvider.js";
import { Readable } from 'stream'

export class MeshesController extends BaseController {
  constructor() {
    super('upload/meshes')
    this.router
      .post('', this.uploadMeshes)
      .get('/token', this.getToken)
      .post('/download', this.downloadModel)
  }

  async uploadMeshes(req, res, next) {
    try {
      const urls = await uploadService.uploadFilesAsync(req.files.meshes, {
        folder: req.query.folder,
        client: '3dmodels',
        roomId: req.query.roomId
      })
      res.send(urls)
    } catch (error) {
      next(error)
    }
  }

  async getToken(req, res, next) {
    try {
      const token = await azureService.generateSASToken('3dmodels')
      res.send({ token })
    } catch (error) {
      next(error)
    }
  }

  async downloadModel(req, res, next) {
    try {
      const { files, roomId } = req.body
      const zipDownload = await azureService.downloadFilesAsZip(files, roomId)
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="download.zip"',
        'Content-Length': zipDownload.length
      })
      const stream = new Readable()
      stream.push(zipDownload)
      stream.push(null)
      stream.pipe(res)
    } catch (error) {
      next(error)
    }
  }
}