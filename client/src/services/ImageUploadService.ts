import { logger } from "@/utils/Logger"
import { api } from "./AxiosService"
import { MeshImage } from "@/models/MeshImage"

class ImageUploadService {


  async uploadImages(images: MeshImage[], onProgress) {
    const blobs = await this.base64ToBlob(...images.map(i => i.data))
    const formData = new FormData()
    images.forEach((img, i) => formData.append('images', blobs[i], `${img.modelName}_angle_${img.angle}`))
    const res = await api.post('upload/images/gif?imageName=turnaround', formData,
      {
        onUploadProgress: onProgress
      })
    logger.log('💌', res.data)
    return res.data
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