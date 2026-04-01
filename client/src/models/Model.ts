import { VectorCoordinates } from "@tresjs/core"
import { PartMesh } from "./PartMesh"
import * as THREE from 'three'
import { Vector3, Group } from "three"
import { logger } from "@/utils/Logger"
import { AppState } from "@/AppState"
import { PartGroup } from "./PartGroup"

interface ModelOptions {
  order?: number
  visible?: boolean
  groupRotation?: VectorCoordinates
  startingScale?: number
}


export class Model extends Group {
  meshes: PartMesh[]
  order?: number
  groupRotation?: VectorCoordinates
  startingScale?: number
  loaded: boolean
  images: string[]
  partGroups: PartGroup[]

  constructor(meshes, options: ModelOptions = {}) {
    super()
    this.meshes = meshes
    this.order = options.order ?? 0
    this.visible = options.visible ?? true
    this.groupRotation = options.groupRotation ?? new Vector3(0, 0, 0)
    this.startingScale = options.startingScale ?? 10
    this.loaded = false
    this.images = []
    this.partGroups = []
    meshes.forEach(m => this.add(m))
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
    logger.log('mesh group loaded and scaled', this)
    AppState.loadedMeshGroups.push(this.uuid)
  }

  toObject() {
    return {
      name: this.name,
      id: this.id,
      meshes: this.meshes,
      partGroups: this.partGroups,
      images: this.images
    }
  }

}