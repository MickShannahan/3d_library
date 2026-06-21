import { logger } from '@/utils/Logger.js'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { MeshImage } from './MeshImage'
import { generateId } from '@/utils/GenerateId'
import { AppState } from '@/AppState'

interface PartMeshOptions {
  _id?: string
  objectName?: string
  name?: string
  resize?: number
  material?: THREE.Material
  src?: string
  bytes?: number
  images?: MeshImage[]
  file?: File
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
  _file?: File
  targetRotation = new THREE.Euler()
  targetPosition = new THREE.Vector3()
  targetScale = new THREE.Vector3(1, 1, 1)

  get fileType(): 'stl' | 'obj' | 'fbx' {
    const check = (this.name?.toLowerCase() ?? '') + (this._src?.toLowerCase() ?? '')
    if (check.includes('.fbx')) return 'fbx'
    if (check.includes('.obj')) return 'obj'
    return 'stl'
  }

  private _load(resize?: number): Promise<this> {
    const type = this.fileType

    if (type === 'obj') {
      return new Promise<this>((resolve, reject) => {
        new OBJLoader().load(
          this.src,
          (group) => {
            const geometries: THREE.BufferGeometry[] = []
            group.traverse(child => {
              if ((child as THREE.Mesh).isMesh) {
                const geo = (child as THREE.Mesh).geometry.clone()
                child.updateWorldMatrix(true, false)
                geo.applyMatrix4(child.matrixWorld)
                geometries.push(geo)
              }
            })
            this.geometry = geometries.length > 1
              ? BufferGeometryUtils.mergeGeometries(geometries)
              : geometries[0] ?? new THREE.BufferGeometry()
            this.bytes = this.geometry.attributes.position?.array.byteLength ?? 0
            if (resize) this._applyResize(resize)
            resolve(this)
          },
          (e) => { this.progress = e.loaded / e.total },
          (err) => { logger.error(err); reject(err) }
        )
      })
    }

    if (type === 'fbx') {
      return new Promise<this>((resolve, reject) => {
        new FBXLoader().load(
          this.src,
          (group) => {
            const geometries: THREE.BufferGeometry[] = []
            group.traverse(child => {
              if ((child as THREE.Mesh).isMesh) {
                const geo = (child as THREE.Mesh).geometry.clone()
                child.updateWorldMatrix(true, false)
                geo.applyMatrix4(child.matrixWorld)
                geometries.push(geo)
              }
            })
            this.geometry = geometries.length > 1
              ? BufferGeometryUtils.mergeGeometries(geometries)
              : geometries[0] ?? new THREE.BufferGeometry()
            this.bytes = this.geometry.attributes.position?.array.byteLength ?? 0
            if (resize) this._applyResize(resize)
            resolve(this)
          },
          (e) => { this.progress = e.loaded / e.total },
          (err) => { logger.error(err); reject(err) }
        )
      })
    }

    // Default: STL
    return new Promise<this>((resolve, reject) => {
      new STLLoader().load(
        this.src,
        (bufferGeo) => {
          this.geometry = bufferGeo
          this.bytes = bufferGeo.attributes.position?.array.byteLength ?? 0
          if (resize) this._applyResize(resize)
          resolve(this)
        },
        (modelProgress) => {
          this.progress = modelProgress.loaded / modelProgress.total
          this.dispatchEvent({ type: 'progress', value: this.progress } as any)
        },
        (err) => { logger.error(err); reject(err) }
      )
    })
  }

  private _applyResize(resize: number) {
    this.geometry.computeBoundingBox()
    const currentSize = this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y
    const scaleFactor = resize / currentSize
    this.scale.set(scaleFactor, scaleFactor, scaleFactor)
  }

  constructor(options: PartMeshOptions = {}) {
    super()
    const { objectName, name, resize, material, src, _id, bytes, images, file } = options
    this._id = _id ?? generateId()
    this.progress = 0
    this.name = objectName ?? name ?? src
    this._src = src
    this.bytes = bytes ?? 0
    this._file = file
    this.material = material ?? new THREE.MeshNormalMaterial()
    this.defaultMaterial = this.material
    this.images = images ?? [] as MeshImage[]
    this.silhouette = false

    this.raycast = () => null

    this.loaded = this._load(resize)
  }

  get src() {
    if (this._src.includes('https://3dlib.blob.core')) {
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


