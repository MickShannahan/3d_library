import BaseController from "../utils/BaseController.js";



export class MeshesController extends BaseController {
  constructor() {
    super('upload/meshes')
    this.router
      .post('', this.uploadMeshes)
  }

  async uploadMeshes(req, res, next) {
    try {
      const meshes = req.files.meshes
      for (let mesh of meshes) {
        console.log(mesh)
      }
      res.send(`uploading ${meshes.length}`)
    } catch (error) {
      next(error)
    }
  }
}