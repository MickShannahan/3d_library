import { logger } from "@/utils/Logger"
import { api } from "./AxiosService"
import { MeshImage } from "@/models/MeshImage"

class ImageUploadService {


  async uploadImagesToGif(images: MeshImage[], onProgress, query = {}): Promise<{ url: string }> {
    const blobs = await this.base64ToBlob(...images.map(i => i.data))
    const formData = new FormData()
    images.forEach((img, i) => formData.append('images', blobs[i], `${img.modelName}_angle_${img.angle}`))
    const res = await api.post(`upload/images/gif`, formData,
      {
        params: { ...query },
        onUploadProgress: (progressEv) => {
          onProgress((progressEv.loaded / progressEv.total) * 95)
        }
      })
    onProgress(100)
    logger.log('💌', res.data)
    return res.data
  }

  async uploadImages(images: MeshImage[], onProgress?, query?): Promise<string[]> {
    const blobs = await this.base64ToBlob(...images.map(i => i.data))
    const formData = new FormData()
    images.forEach((img, i) => formData.append('images', blobs[i], `${img.modelName}_angle_${img.angle}`))
    const res = await api.post('upload/images', formData,
      {
        params: { ...query },
        onUploadProgress: (progressEv) => {
          onProgress((progressEv.loaded / progressEv.total) * 95)
        }
      })
    onProgress(100)
    logger.log('💌', res.data)
    return res.data
  }

  scoped(onProgress: (percent: number) => void, defaults: Record<string, any> = {}) {
    return {
      images: (images: MeshImage[], params: Record<string, any> = {}) =>
        this.uploadImages(images, onProgress, { ...defaults, ...params }),
      gif: (images: MeshImage[], params: Record<string, any> = {}) =>
        this.uploadImagesToGif(images, onProgress, { ...defaults, ...params }),
    }
  }

  async base64ToBlob(...strings) {
    const blobs = []
    for (const string of strings) {
      const res = await fetch(string)
      const blob = await res.blob()
      blobs.push(blob)
    }
    return blobs
  }
}

export const imageUploadService = new ImageUploadService()