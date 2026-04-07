import BaseController from "../utils/BaseController.js";
import { uploadService } from "../services/UploadService.js";

export class MeshesController extends BaseController {
  constructor() {
    super('upload/meshes')
    this.router
      .post('', this.uploadMeshes)
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
}