import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'


const loader = new STLLoader()

interface PartMeshOptions {
  objectName?: string
  resize?: number
  material?: THREE.Material
}

export class PartMesh extends THREE.Mesh {
  progress: number
  loaded: Promise<this>
  defaultMaterial: THREE.Material
  images: string[]
  silhouette: boolean
  targetRotation = new THREE.Euler()
  targetPosition = new THREE.Vector3()
  targetScale = new THREE.Vector3(1, 1, 1)

  constructor(path: string = '', options: PartMeshOptions = {}) {
    super()
    const { objectName, resize, material } = options
    this.progress = 0
    this.name = objectName || path
    this.material = material || new THREE.MeshNormalMaterial()
    this.defaultMaterial = this.material
    this.images = []
    this.silhouette = false

    this.raycast = () => null

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


  toObject() {
    return {
      name: this.name,
      id: this.id,
      images: this.images
    }
  }
}

