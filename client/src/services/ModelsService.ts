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

  private _buildJobQueue(model: Model) {
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
        const subJobs = model.meshes.map(mesh => ({ mesh, subJob: job.createSubJob(mesh.name) }))
        let totalDone = 0
        const totalImages = model.meshes.length

        await Promise.all(subJobs.map(async ({ mesh, subJob }) => {
          subJob.status = 'active'
          const uploaded = await imageUploadService.uploadImages(
            mesh.images,
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

      .addJobToQueue('Uploading Rendered Previews', async (onProgress, job) => {
        const newPreviews = model.renderedPreviews.filter(p => !p.url.includes('https://'))
        if (!newPreviews.length) { onProgress(100); return }

        const form = new FormData()
        newPreviews.forEach(p => form.append('images', p._file, p._file.name))
        const res = await api.post('upload/images', form, {
          params: { folder: model.folderRef },
          onUploadProgress: e => onProgress((e.loaded / e.total) * 100)
        })
        const uploadedUrls: string[] = res.data
        newPreviews.forEach((p, i) => { p.url = uploadedUrls[i] ?? p.url })
        onProgress(100)
      })

      .addJobToQueue('Uploading Meshes', async (onProgress, job) => {
        // Only upload mesh files that haven't been uploaded to Azure yet
        const meshesToUpload = model.meshes.filter(m => !m._src.includes('https://3dlib.blob.core'))
        const meshCount = meshesToUpload.length
        if (meshCount === 0) { onProgress(100); return }

        let done = 0
        logger.log('📟 setting up uploads', meshesToUpload.length)
        await Promise.all(meshesToUpload.map(async (mesh: PartMesh) => {
          const subJob = job.createSubJob(mesh.name)
          subJob.status = 'active'
          const form = new FormData()

          if (mesh.fileType !== 'stl' && mesh._file) {
            // OBJ / FBX: upload the original file as-is
            form.append('meshes', mesh._file, mesh.name)
          } else {
            // STL: export from the Three.js geometry (bakes current scene state)
            const exportMesh = new Mesh(mesh.geometry)
            exportMesh.updateMatrixWorld(true)
            form.append('meshes', new Blob([exporter.parse(exportMesh, { binary: true })]), mesh.name)
          }

          // Set up socket for Azure upload progress
          const { ready, complete: azureComplete } = socketService.waitForUploadComplete(mesh._id, (loadedBytes, totalBytes) => {
            subJob.progress = 50 + (loadedBytes / totalBytes) * 50
          })
          await ready
          const res = await api.post('upload/meshes', form, {
            params: { folder: model.folderRef, roomId: mesh._id },
            onUploadProgress: e => { subJob.progress = (e.loaded / e.total) * 50 }
          })

          await azureComplete
          mesh.src = res.data[0]
          subJob.progress = 100
          subJob.status = 'complete'
          onProgress((++done / meshCount) * 100)
        }))
      })

      .addJobToQueue('Saving model', async (onProgress) => {
        const modelData = model.toData()
        logger.log('🗿📦', modelData)
        const res = await api.post('api/models', modelData, {
          onUploadProgress: e => onProgress((e.loaded / e.total) * 100)
        })
        const saved = new Model(res.data)
        const idx = AppState.models.findIndex(m => m._id === saved._id)
        if (idx !== -1) AppState.models.splice(idx, 1, saved)
        else AppState.models.push(saved)
        if (AppState.activeModel?._id === saved._id) AppState.activeModel = saved
      })
  }

  async createModel(model: Model) {
    this._buildJobQueue(model)
    await jobsService.runQueue()
  }

  async updateModel(model: Model) {
    this._buildJobQueue(model)
    await jobsService.runQueue()
  }

  async deleteModel(modelId) {
    await api.delete(`api/models/${modelId}`)
    AppState.models = AppState.models.filter(m => m._id != modelId)
  }

}

export const modelsService = new ModelsService()