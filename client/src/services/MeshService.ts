import { AppState } from "@/AppState"
import { MeshGroup } from "@/models/MeshGroup"
import { STLMesh } from "@/models/STLMesh"
import { markRaw } from "vue"


class MeshService {

  addMeshGroups(newMeshGroups: MeshGroup | STLMesh[]) {
    if (newMeshGroups instanceof MeshGroup) {
      AppState.meshGroups = [...AppState.meshGroups, markRaw(newMeshGroups)]
    } else {
      AppState.meshGroups = [...AppState.meshGroups, markRaw(new MeshGroup(newMeshGroups))]
    }
  }

  clearSelectedMeshIds() {
    AppState.selectedMeshIds = []
  }

  selectMeshId(meshId, clearFirst = true) {
    if (clearFirst) this.clearSelectedMeshIds()
    AppState.selectedMeshIds.push(meshId)
  }

  selectGroupOfMeshId(meshIds, clearFirst = true) {
    if (clearFirst) this.clearSelectedMeshIds()
    AppState.selectedMeshIds.push(...meshIds)
  }


}

export const meshService = new MeshService()