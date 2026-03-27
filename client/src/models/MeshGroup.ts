import { VectorCoordinates } from "@tresjs/core"
import { STLMesh } from "./STLMesh"
import { Vector3 } from "three"


export class MeshGroup {
  meshes: STLMesh[]
  order: number
  visible: boolean
  groupRotation: VectorCoordinates

  constructor(meshes, { order, visible, groupRotation }) {
    this.meshes = meshes
    this.order = order ?? 0
    this.visible = visible ?? true
    this.groupRotation = groupRotation ?? new Vector3(0, 0, 0)
  }
}