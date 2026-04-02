import { logger } from "@/utils/Logger"
import { api } from "./AxiosService"
import { Model } from "@/models/Model"
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { Job } from "@/models/Job"
import { AppState } from "@/AppState"
import { cameraState } from "@/utils/CameraState"
import { imageUploadService } from "./ImageUploadService"

const exporter = new GLTFExporter()

class ModelsService {

  async createModel(model: Model) {
    AppState.jobs = [

      new Job({
        label: 'Capturing 360 turnaround',
        indeterminate: true,
        run: async () => {
          await cameraState.cameraRef.snap360(model)
        }
      }),

      new Job({
        label: `Capturing ${model.meshes.length} part images`,
        indeterminate: true,
        run: async () => {
          for (const part of model.meshes) {
            await cameraState.cameraRef.snap360(part)
          }
        }
      }),

      new Job({
        label: 'Uploading images',
        indeterminate: false,
        run: async (onProgress) => {
          const allImages = [
            ...model.images,
            ...model.meshes.flatMap(m => m.images)
          ]
          await imageUploadService.uploadImages(allImages, onProgress)
        }
      }),

      new Job({
        label: 'Uploading meshes',
        indeterminate: false,
        run: async (onProgress) => {
          const meshForm = new FormData()
          for (const mesh of model.meshes) {
            await new Promise((res, rej): void => {
              exporter.parse(mesh, (gltf) => {
                const blob = new Blob([JSON.stringify(gltf)], { type: 'model/gltf+json' })
                meshForm.append('meshes', blob, mesh.name)
                res(null)
              }, rej)
            })
          }
          await api.post('upload/meshes', meshForm, {
            onUploadProgress: (e) => onProgress((e.loaded / e.total) * 100)
          })
        }
      }),

      new Job({
        label: 'Saving model',
        indeterminate: false,
        run: async (onProgress) => {
          const res = await api.post('api/models', model.toData(), {
            onUploadProgress: (e) => onProgress((e.loaded / e.total) * 100)
          })
          logger.log(res.data)
        }
      }),

    ]

    for (const job of AppState.jobs) {
      await job.execute()
    }

  }
}


export const modelsService = new ModelsService()