import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const loader = new STLLoader()

export class STLMesh extends THREE.Mesh {
  progress: number
  loaded: Promise<this>

  constructor(path: string = '', fixedSize?= 0) {
    super()
    this.progress = 0
    this.loaded = new Promise<this>((resolve, reject) => {
      loader.load(
        path,
        (bufferGeo) => {
          this.geometry = bufferGeo
          if (fixedSize) {
            this.geometry.computeBoundingBox()
            const currentSize = this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y
            const scaleFactor = fixedSize / currentSize
            this.scale.set(scaleFactor, scaleFactor, scaleFactor)
          }
          resolve(this)
        },
        (modelProgress) => {
          this.progress = modelProgress.loaded / modelProgress.total
        },
        (err) => {
          logger.error(err)
          reject(err)
        }
      )
    })
  }
}