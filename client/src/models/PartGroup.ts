import { AppState } from "@/AppState"



export class PartGroup {
  name: string
  partIds: string[]
  defaultPartId: string
  modelId: string

  constructor({ name, partIds, modelId }) {
    this.name = name
    this.partIds = partIds ?? []
    this.defaultPartId = partIds[0]
    this.modelId = modelId
  }

  get parts() {
    const meshes = this.model.meshes.filter(m => this.partIds.includes(m.id) || this.partIds.includes(m.uuid))
    return meshes
  }


  get model() {
    const model = AppState.meshGroups.find(mg => mg.id == this.modelId || mg.uuid == this.modelId)
    return model
  }


}