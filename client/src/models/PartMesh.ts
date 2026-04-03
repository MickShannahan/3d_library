import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { MeshImage } from './MeshImage'
import { generateId } from '@/utils/GenerateId'


const loader = new STLLoader()

interface PartMeshOptions {
  _id?: string
  objectName?: string
  resize?: number
  material?: THREE.Material
  src?: string
}

export class PartMesh extends THREE.Mesh {
  _id: string
  progress: number
  loaded: Promise<this>
  defaultMaterial: THREE.Material
  images: MeshImage[]
  silhouette: boolean
  src: string
  targetRotation = new THREE.Euler()
  targetPosition = new THREE.Vector3()
  targetScale = new THREE.Vector3(1, 1, 1)

  constructor(options: PartMeshOptions = {}) {
    super()
    const { objectName, resize, material, src, _id } = options
    this._id = _id ?? generateId()
    this.progress = 0
    this.name = objectName ?? src
    this.src = src
    this.material = material ?? new THREE.MeshNormalMaterial()
    this.defaultMaterial = this.material
    this.images = []
    this.silhouette = false

    this.raycast = () => null

    this.loaded = new Promise<this>((resolve, reject) => {
      loader.load(
        this.src,
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


  toData() {
    return {
      id: this.id,
      name: this.name,
      images: this.images,
      src: this.src
    }
  }
}

