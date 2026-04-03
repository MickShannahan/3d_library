import { logger } from "@/utils/Logger"
import { api } from "./AxiosService"
import { Model } from "@/models/Model"
import { STLExporter } from "three/examples/jsm/Addons.js"
import { Job } from "@/models/Job"
import { AppState } from "@/AppState"
import { cameraState } from "@/utils/CameraState"
import { imageUploadService } from "./ImageUploadService"

const exporter = new STLExporter()

class ModelsService {

  async createModel(model: Model) {
    AppState.jobs = [

      new Job({
        label: 'Capturing 360 turnaround',
        indeterminate: true,
        run: async () => {
          await cameraState.cameraRef.snap360(model, 32)
        }
      }),

      new Job({
        label: `Capturing ${model.meshes.length} part images`,
        indeterminate: true,
        run: async () => {
          for (const part of model.meshes) {
            await cameraState.cameraRef.snap360(part, 2, true)
          }
        }
      }),

      new Job({
        label: 'Uploading Model Images',
        indeterminate: false,
        run: async (onProgress) => {
          const cover = await imageUploadService.uploadImages([model.images[0]], onProgress)
          const gif = await imageUploadService.uploadImagesToGif(model.images, onProgress)
          model.turnAroundImage = gif
          model.coverImage = cover
          model.images = []
          logger.log(cover, gif)
        }
      }),

      new Job({
        label: 'Uploading Part Images',
        indeterminate: false,
        run: async (onProgress) => {
          const images = model.meshes.flatMap(m => m.images)
          const uploaded = await imageUploadService.uploadImages(images, onProgress)
          model.meshes.forEach(mesh => {
            mesh.images = uploaded.filter(img => img.includes(mesh.name))
          })
          logger.log(model.meshes)
        }
      }),

      new Job({
        label: 'Uploading meshes',
        indeterminate: false,
        run: async (onProgress, jobCtx) => {
          let meshCount = model.meshes.length
          let totalProgress = 0
          for (const mesh of model.meshes) {
            jobCtx.description = `${mesh.name}`
            const meshForm = new FormData()
            const data = exporter.parse(mesh, { binary: true })
            const blob = new Blob([data])
            meshForm.append('meshes', blob, mesh.name)
            const res = await api.post('upload/meshes', meshForm)
            onProgress((++totalProgress / meshCount) * 100)
          }
        }
      }),

      new Job({
        label: 'Saving model',
        indeterminate: false,
        run: async (onProgress) => {
          const modelData = model.toData()
          logger.log('🗿📦', modelData)
          const res = await api.post('api/models', modelData, {
            onUploadProgress: (e) => onProgress((e.loaded / e.total) * 100)
          })
          logger.log(res.data)
        }
      }),

    ]

    for (const job of AppState.jobs) {
      logger.log('🦧', job.label)
      await job.execute()
    }

  }
}


export const modelsService = new ModelsService()