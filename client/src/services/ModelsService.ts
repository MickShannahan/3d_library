import { logger } from "@/utils/Logger"
import { api } from "./AxiosService"
import { Model } from "@/models/Model"
import { STLExporter } from "three/examples/jsm/Addons.js"
import { Mesh } from "three"
import { cameraState } from "@/utils/CameraState"
import { imageUploadService } from "./ImageUploadService"
import { jobsService } from "./JobService"
import { AppState } from "@/AppState"
import { PartMesh } from "@/models/PartMesh"
import { socketService } from "./SocketService"

const exporter = new STLExporter()

class ModelsService {


  async getModels() {
    const res = await api.get('api/models')
    const models = res.data.map(d => new Model(d))
    logger.log('models', models)
    AppState.models = models
  }

  setActiveModel(model) {
    AppState.activeModel = model
  }


  async createModel(model: Model) {

    jobsService.clearJobQueue()
    jobsService
      .addJobToQueue('Capturing 360 turnaround', async () => {
        await cameraState.cameraRef.snap360(model, 44)
      }, { indeterminate: true })

      .addJobToQueue(`Capturing ${model.meshes.length} part images`, async () => {
        for (const part of model.meshes) await cameraState.cameraRef.snap360(part, 2, true)
      }, { indeterminate: true })

      .addJobToQueue('Uploading Model Images', async (onProgress, job) => {
        const coverSubJob = job.createSubJob('Cover image')
        const gifSubJob = job.createSubJob('Turnaround GIF')

        coverSubJob.status = 'active'
        const [cover] = await imageUploadService.uploadImages([model.images[0]], (p) => { coverSubJob.progress = p }, { folder: model.folderRef })
        coverSubJob.status = 'complete'
        model.coverImage = cover

        gifSubJob.status = 'active'
        const { url } = await imageUploadService.uploadImagesToGif(model.images, (p) => { gifSubJob.progress = p }, { folder: model.folderRef, imageName: `${model.name}_turnaround` })
        gifSubJob.status = 'complete'
        model.turnAroundImage = url
        model.images = []

        onProgress(100)
      })

      .addJobToQueue('Uploading Part Images', async (onProgress, job) => {
        const images = model.meshes.flatMap(m => m.images)
        const subJobs = model.meshes.map(mesh => ({ mesh, subJob: job.createSubJob(mesh.name) }))

        let totalDone = 0
        const totalImages = model.meshes.length

        await Promise.all(subJobs.map(async ({ mesh, subJob }) => {
          subJob.status = 'active'
          const meshImages = mesh.images
          const uploaded = await imageUploadService.uploadImages(
            meshImages,
            (p) => { subJob.progress = p },
            { folder: model.folderRef }
          )
          mesh.images.forEach(img => {
            const url = uploaded.find(u => u.includes(mesh.name) && u.includes(img.angle))
            if (url) { img.data = url; img.type = url.slice(url.lastIndexOf('.')) }
          })
          subJob.status = 'complete'
          onProgress((++totalDone / totalImages) * 100)
        }))
      })

      .addJobToQueue('Uploading Meshes', async (onProgress, job) => {
        const meshCount = model.meshes.length
        let done = 0
        await Promise.all(model.meshes.map(async (mesh: PartMesh) => {
          const subJob = job.createSubJob(mesh.name)
          subJob.status = 'active'
          const form = new FormData()
          const exportMesh = new Mesh(mesh.geometry) // new mesh so world transforms don't apply
          exportMesh.updateMatrixWorld(true)
          form.append('meshes', new Blob([exporter.parse(exportMesh, { binary: true })]), mesh.name)
          logger.log('socket')
          // Set up socket
          const { ready, complete: azureComplete } = socketService.waitForUploadComplete(mesh._id, (loadedBytes, totalBytes) => {
            subJob.progress = 50 + (loadedBytes / totalBytes) * 50
          })
          await ready
          logger.log('post')
          // Send Mesh
          const res = await api.post('upload/meshes', form, {
            params: { folder: model.folderRef, roomId: mesh._id },
            onUploadProgress: e => { subJob.progress = (e.loaded / e.total) * 50 }
          })
          mesh.src = res.data[0]

          await azureComplete
          subJob.progress = 100
          subJob.status = 'complete'
          onProgress((++done / meshCount) * 100)
        }))
      })

      .addJobToQueue('Saving model', async (onProgress) => {
        const modelData = model.toData()
        logger.log('🗿📦', modelData)
        await api.post('api/models', modelData, {
          onUploadProgress: e => onProgress((e.loaded / e.total) * 100)
        })
      })

    await jobsService.runQueue()
  }

  async deleteModel(modelId) {
    const res = await api.delete(`api/models/${modelId}`)
    AppState.models = AppState.models.filter(m => m._id != modelId)
  }

}

export const modelsService = new ModelsService()