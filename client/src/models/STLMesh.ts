import { cameraState } from '@/utils/CameraState'
import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'


const loader = new STLLoader()

interface STLMeshOptions {
  objectName?: string
  resize?: number
  material?: THREE.Material
}

export class STLMesh extends THREE.Mesh {
  progress: number
  loaded: Promise<this>
  defaultMaterial: THREE.Material

  constructor(path: string = '', options: STLMeshOptions = {}) {
    super()
    const { objectName, resize, material } = options
    this.progress = 0
    this.name = objectName || path
    this.material = material || new THREE.MeshNormalMaterial()
    this.defaultMaterial = this.material

    const ogCast = super.raycast.bind(this)
    this.raycast = (caster, intersects) => {
      return cameraState.isPanning ? null : ogCast(caster, intersects)
    }

    this.loaded = new Promise<this>((resolve, reject) => {
      loader.load(
        path,
        (bufferGeo) => {
          this.geometry = bufferGeo
          if (resize) {
            this.geometry.computeBoundingBox()
            const currentSize = this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y
            const scaleFactor = resize / currentSize
            this.scale.set(scaleFactor, scaleFactor, scaleFactor)
          }
          resolve(this)
        },
        (modelProgress) => {
          this.progress = modelProgress.loaded / modelProgress.total
          this.dispatchEvent({ type: 'progress', value: this.progress })
        },
        (err) => {
          logger.error(err)
          reject(err)
        }
      )
    })
  }
}

