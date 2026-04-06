import { logger } from "@/utils/Logger"
import { api } from "./AxiosService"
import { Model } from "@/models/Model"
import { STLExporter } from "three/examples/jsm/Addons.js"
import { cameraState } from "@/utils/CameraState"
import { imageUploadService } from "./ImageUploadService"
import { jobsService } from "./JobService"

const exporter = new STLExporter()

class ModelsService {

  async createModel(model: Model) {

    jobsService
      .addJobToQueue('Capturing 360 turnaround', async () => {
        await cameraState.cameraRef.snap360(model, 32)
      }, { indeterminate: true })

      .addJobToQueue(`Capturing ${model.meshes.length} part images`, async () => {
        for (const part of model.meshes) await cameraState.cameraRef.snap360(part, 2, true)
      }, { indeterminate: true })

      .addJobToQueue('Uploading Model Images', async (onProgress, job) => {
        const coverSubJob = job.createSubJob('Cover image')
        const gifSubJob = job.createSubJob('Turnaround GIF')

        coverSubJob.status = 'active'
        const [cover] = await imageUploadService.uploadImages([model.images[0]], (p) => { coverSubJob.progress = p }, { folder: model.name })
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
        await Promise.all(model.meshes.map(async (mesh) => {
          const subJob = job.createSubJob(mesh.name)
          subJob.status = 'active'
          const form = new FormData()
          form.append('meshes', new Blob([exporter.parse(mesh, { binary: true })]), mesh.name)
          await api.post('upload/meshes', form, {
            params: { folder: model.folderRef },
            onUploadProgress: e => { subJob.progress = (e.loaded / e.total) * 95 }
          })
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

}

export const modelsService = new ModelsService()