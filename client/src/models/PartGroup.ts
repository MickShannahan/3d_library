import { AppState } from "@/AppState"
import { logger } from "@/utils/Logger"
import { Model } from "./Model"



export class PartGroup {
  name: string
  partIds: string[]
  defaultPartId: string
  _parentModel: Model

  constructor({ name, partIds, modelId }, parentModel) {
    this.name = name
    this.partIds = partIds ?? []
    this.defaultPartId = partIds[0]
    this._parentModel = parentModel
  }

  get parts() {
    const meshes = this.model.meshes.filter(m => this.partIds.includes(m._id) || this.partIds.includes(m._id))
    return meshes
  }


  get model() {
    return this._parentModel
  }

  static GROUP_COLORS = ['--bs-normal', '--bs-normal-x', '--bs-normal-shadow', '--bs-indigo', '--bs-blue', '--bs-orange', '--bs-cyan', '--bs-purple']

}