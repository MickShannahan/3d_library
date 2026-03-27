import { AppState } from "@/AppState"
import { STLMesh } from "@/models/STLMesh"


class MeshService {

  addMeshGroups(newMeshGroups: STLMesh[]) {
    AppState.meshGroups = [...AppState.meshGroups, ...newMeshGroups]
  }


}

export const meshService = new MeshService()