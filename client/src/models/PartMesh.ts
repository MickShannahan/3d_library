import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { MeshImage } from './MeshImage'
import { generateId } from '@/utils/GenerateId'
import { AppState } from '@/AppState'


const loader = new STLLoader()

interface PartMeshOptions {
  _id?: string
  objectName?: string
  name?: string
  resize?: number
  material?: THREE.Material
  src?: string
  bytes?: number
  images?: MeshImage[]
}

export class PartMesh extends THREE.Mesh {
  _id: string
  progress: number
  loaded: Promise<this>
  defaultMaterial: THREE.Material
  images: MeshImage[]
  silhouette: boolean
  _src: string
  bytes: number
  targetRotation = new THREE.Euler()
  targetPosition = new THREE.Vector3()
  targetScale = new THREE.Vector3(1, 1, 1)

  constructor(options: PartMeshOptions = {}) {
    super()
    const { objectName, name, resize, material, src, _id, bytes, images } = options
    this._id = _id ?? generateId()
    this.progress = 0
    this.name = objectName ?? name ?? src
    this._src = src
    this.bytes = bytes ?? 0
    this.material = material ?? new THREE.MeshNormalMaterial()
    this.defaultMaterial = this.material
    this.images = images ?? [] as MeshImage[]
    this.silhouette = false

    this.raycast = () => null

    this.loaded = new Promise<this>((resolve, reject) => {
      loader.load(
        this.src,
        (bufferGeo) => {
          this.geometry = bufferGeo
          this.bytes = bufferGeo.attributes.position?.array.byteLength ?? 0
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
          this.dispatchEvent({ type: 'progress', value: this.progress } as any) // not sure how to extend that
        },
        (err) => {
          logger.error(err)
          reject(err)
        }
      )
    })
  }

  get src() {
    if (window.origin.includes('https://3dlib.blob.core')) {
      return this._src + '?' + AppState.sasToken
    }
    return this._src
  }

  set src(v) {
    this._src = v
  }


  toData() {
    return {
      _id: this._id,
      name: this.name,
      images: this.images,
      src: this._src,
      bytes: this.bytes
    }
  }
}

