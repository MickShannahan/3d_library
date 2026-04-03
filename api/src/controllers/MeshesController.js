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
      const allMeshes = meshes.length ? meshes : [meshes]
      for (let mesh of allMeshes) {
        console.log('uploaded', mesh.name)
      }
      res.send({ msg: `uploading ${allMeshes.map(m => m.name + '\n')}` })
    } catch (error) {
      next(error)
    }
  }
}