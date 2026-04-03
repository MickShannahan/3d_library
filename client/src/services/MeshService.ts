import { AppState } from "@/AppState"
import { Model } from "@/models/Model"
import { PartMesh } from "@/models/PartMesh"
import { logger } from "@/utils/Logger"
import { markRaw } from "vue"


class MeshService {

  addMeshGroups(newMeshGroups: Model | PartMesh[]) {
    if (newMeshGroups instanceof Model) {
      AppState.meshGroups = [...AppState.meshGroups, newMeshGroups]
    } else {
      AppState.meshGroups = [...AppState.meshGroups, new Model({ meshes: newMeshGroups })]
    }
  }

  clearSelectedMeshIds() {
    AppState.selectedMeshIds = []
  }

  selectMeshId(meshId, clearFirst = true) {
    if (clearFirst) this.clearSelectedMeshIds()
    AppState.selectedMeshIds.push(meshId)
  }

  selectGroupOfMeshId(meshIds: string[], clearFirst = true) {
    if (clearFirst) this.clearSelectedMeshIds()
    AppState.selectedMeshIds.push(...meshIds)
  }

  destroyMesh(mesh: PartMesh) {
    const group = AppState.meshGroups.find(g => g.meshes.includes(mesh))
    group.meshes.splice(group.meshes.indexOf(mesh), 1)
    if (group.meshes.length == 0) {
      this.destroyMeshGroup(group.uuid)
    }
  }

  destroyMeshGroup(uuid: string) {
    const groupToDestroy = AppState.meshGroups.findIndex(mg => mg.uuid === uuid)
    if (groupToDestroy == -1) return
    AppState.meshGroups.splice(groupToDestroy, 1)
    AppState.loadedMeshGroups.splice(AppState.loadedMeshGroups.indexOf(uuid), 1)
  }

  hideAllMeshes(onlySilhouette = false) {
    const meshesToHide = AppState.meshGroups.flatMap(mg => mg.meshes)
    meshesToHide.forEach(m => onlySilhouette ? m.silhouette = true : m.visible = false)
  }

  showAllMeshes(onlySilhouette = false) {
    const meshesToHide = AppState.meshGroups.flatMap(mg => mg.meshes)
    meshesToHide.forEach(m => onlySilhouette ? m.silhouette = false : m.visible = true)
  }

}

export const meshService = new MeshService()