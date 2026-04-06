import { VectorCoordinates } from "@tresjs/core"
import { PartMesh } from "./PartMesh"
import * as THREE from 'three'
import { Vector3, Group } from "three"
import { logger } from "@/utils/Logger"
import { AppState } from "@/AppState"
import { PartGroup } from "./PartGroup"
import { MeshImage } from "./MeshImage"
import { generateId } from "@/utils/GenerateId"
import { Author } from "./Author"

interface ModelOptions {
  _id?: string
  meshes?: PartMesh[]
  order?: number
  visible?: boolean
  groupRotation?: VectorCoordinates
  startingScale?: number
  coverImage?: string
  turnAroundImage?: string
  author?: Author | null
  tags?: string[]
  price?: number
  adjustedScale?: number
  size?: number
}

export class Model extends Group {
  _id: string
  meshes: PartMesh[]
  order?: number
  groupRotation?: VectorCoordinates
  startingScale?: number
  loaded: boolean
  images: MeshImage[]
  coverImage: string
  turnAroundImage: string
  partGroups: PartGroup[]
  author: Author | null
  tags: string[]
  price: number
  adjustedScale: number
  size: number

  constructor(options: ModelOptions = {}) {
    super()
    this._id = options._id ?? generateId()
    this.meshes = options.meshes
    this.order = options.order ?? 0
    this.visible = options.visible ?? true
    this.groupRotation = options.groupRotation ?? new Vector3(0, 0, 0)
    this.startingScale = options.startingScale ?? 10
    this.loaded = false
    this.images = []
    this.coverImage = options.coverImage ?? ''
    this.turnAroundImage = options.turnAroundImage ?? ''
    this.partGroups = []
    this.author = options.author ?? null
    this.tags = options.tags ?? []
    this.price = options.price ?? 0
    this.adjustedScale = options.adjustedScale ?? 1
    this.size = options.size ?? 0
    this.meshes.forEach(m => this.add(m))
    this.initialize()
  }

  async initialize() {
    const loadedMeshes = this.meshes.map(m => m.loaded)
    await Promise.all(loadedMeshes)
    this.loaded = true
    const box = new THREE.Box3().setFromObject(this)
    const boxSize = box.getSize(new THREE.Vector3())
    const maxBoxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z)
    const scaleFactor = this.startingScale / maxBoxDimension
    this.scale.set(scaleFactor, scaleFactor, scaleFactor)
    box.setFromObject(this)

    const center = box.getCenter(new THREE.Vector3())
    const bottomOffset = -box.min.y
    this.position.set(-center.x, bottomOffset, -center.z)
    logger.log('🗿❇️', this)
    AppState.loadedMeshGroups.push(this.uuid)
  }

  get folderRef() {
    return this.name + '_' + this._id
  }

  toData() {
    return {
      _id: this._id,
      name: this.name,
      meshes: this.meshes.map(m => m.toData()),
      partGroups: this.partGroups,
      images: this.images,
      coverImage: this.coverImage,
      turnAroundImage: this.turnAroundImage,
      author: this.author?._id ?? null,
      tags: this.tags,
      price: this.price,
      adjustedScale: this.adjustedScale,
      size: this.size
    }
  }

}