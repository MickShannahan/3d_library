import { AppState } from "@/AppState"
import { Job } from "@/models/Job"
import { Model } from "@/models/Model"
import { PartMesh } from "@/models/PartMesh"
import { logger } from "@/utils/Logger"
import { generateId } from "@/utils/GenerateId"
import { markRaw } from "vue"
import { api } from "./AxiosService"
import { socketService } from "./SocketService"


class MeshService {

  private _recentlyHiddenMeshes: PartMesh[] = []

  addFilesToScene(files: FileList) {
    logger.log('📂', files)
    const currentFileGroup = AppState.meshGroups[0]
    const stlMeshes = [...files].map(f => markRaw(new PartMesh({
      src: URL.createObjectURL(f),
      objectName: f.name
    })))
    if (currentFileGroup) {
      currentFileGroup.meshes.push(...stlMeshes)
    } else {
      meshService.addMeshGroups(stlMeshes)
    }
  }

  addMeshGroups(newMeshGroups: Model | PartMesh[]) {
    if (newMeshGroups instanceof Model) {
      AppState.meshGroups = [...AppState.meshGroups, newMeshGroups]
      newMeshGroups.load()
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
      this.destroyMeshGroup(group._id)
    }
  }

  destroyMeshGroup(id: string) {
    const groupToDestroy = AppState.meshGroups.findIndex(mg => mg._id === id)
    if (groupToDestroy == -1) return
    AppState.meshGroups.splice(groupToDestroy, 1)
    AppState.loadedMeshGroups.splice(AppState.loadedMeshGroups.indexOf(id), 1)
  }

  hideMesh(mesh: PartMesh, onlySilhouette = false) {
    this._recentlyHiddenMeshes.push(mesh)
    onlySilhouette ? mesh.silhouette = true : mesh.visible = false
  }

  showMesh(mesh: PartMesh, onlySilhouette = false) {
    this._recentlyHiddenMeshes = this._recentlyHiddenMeshes.filter(m => m != mesh)
    onlySilhouette ? mesh.silhouette = false : mesh.visible = true
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

  async getToken() {
    const res = await api.get('upload/meshes/token')
    AppState.sasToken = res.data.token
    return res.data.token
  }

  async downloadMeshes(meshes: string[], modelName: string) {
    const roomId = `download_${modelName}_${generateId()}`
    const job = new Job({
      label: `Downloading ${modelName}`,
      indeterminate: false,
      description: getMeshNameFromUrl(meshes[0]),
      run: async (onProgress, job) => {
        const cleanup = socketService.watchDownloadRoom(roomId, (done, total) => {
          job.description = getMeshNameFromUrl(meshes[done])
          onProgress(Math.round((done / total) * 100))
        })
        try {
          const res = await api.post('upload/meshes/download', { files: meshes, roomId }, { responseType: 'blob' })
          const download = URL.createObjectURL(res.data)
          const link = document.createElement('a')
          link.href = download
          link.download = `${modelName}.zip`
          link.click()
          URL.revokeObjectURL(download)
        } finally {
          cleanup()
        }
      }
    })
    AppState.downloadJobs.push(job)
    await AppState.downloadJobs[AppState.downloadJobs.length - 1].execute()
  }
}

function getMeshNameFromUrl(url) {
  if (!url) return
  return url.slice(url.lastIndexOf('/') + 1)
}

export const meshService = new MeshService()