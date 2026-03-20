import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const loader = new STLLoader()

export class STLMesh extends THREE.Mesh {
  progress: number
  loaded: Promise<this>

  constructor(path: string = '') {
    super()
    this.progress = 0
    this.loaded = new Promise<this>((resolve, reject) => {
      loader.load(
        path,
        (bufferGeo) => {
          this.geometry = bufferGeo
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