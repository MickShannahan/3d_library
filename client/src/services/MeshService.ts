import { AppState } from "@/AppState"
import { Model } from "@/models/Model"
import { PartMesh } from "@/models/PartMesh"
import { logger } from "@/utils/Logger"
import { markRaw } from "vue"


class MeshService {

  private _recentlyHiddenMeshes: PartMesh[] = []

  addMeshGroups(newMeshGroups: Model | PartMesh[]) {
    if (newMeshGroups instanceof Model) {
      AppState.meshGroups = [...AppState.meshGroups, newMeshGroups]
    } else {
      const model = new Model({ meshes: newMeshGroups })
      model.load()
      AppState.meshGroups = [...AppState.meshGroups, model]
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

  hideMesh(mesh: PartMesh, onlySilhouette = false) {
    this._recentlyHiddenMeshes.push(mesh)
    onlySilhouette ? mesh.silhouette = true : mesh.visible = false
    onlySilhouette ? '' : mesh.isVisible = false
  }

  showMesh(mesh: PartMesh, onlySilhouette = false) {
    this._recentlyHiddenMeshes = this._recentlyHiddenMeshes.filter(m => m != mesh)
    onlySilhouette ? mesh.silhouette = false : mesh.visible = true
    onlySilhouette ? '' : mesh.isVisible = true
  }

  toggleVisibility(mesh: PartMesh, onlySilhouette = false) {
    if (mesh.visible) {
      this.hideMesh(mesh, onlySilhouette)
    } else {
      this.showMesh(mesh, onlySilhouette)
    }
  }

  hideAllMeshes(onlySilhouette = false) {
    const meshesToHide = AppState.meshGroups.flatMap(mg => mg.meshes)
    meshesToHide.forEach(m => {
      if (m.visible == true) this._recentlyHiddenMeshes.push(m)
      onlySilhouette ? m.silhouette = true : m.visible = false
    })
  }

  showAllMeshes(onlySilhouette = false) {
    const meshesToHide = AppState.meshGroups.flatMap(mg => mg.meshes)
    meshesToHide.forEach(m => onlySilhouette ? m.silhouette = false : m.visible = true)
  }

  reshowHiddenMeshes(onlySilhouette = false) {
    this._recentlyHiddenMeshes.forEach(m => onlySilhouette ? m.silhouette = false : m.visible = true)
    this._recentlyHiddenMeshes = []
  }

}

export const meshService = new MeshService()