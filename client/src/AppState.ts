import { reactive } from "vue";
import { MeshGroup } from "./models/MeshGroup";
import { UUID } from "crypto";

interface AppState {
  meshGroups: MeshGroup[]
  selectedMeshIds: string[]
  loadedMeshGroups: string[]
  scaleModelsBy: 0
}

export const AppState = reactive<AppState>({
  meshGroups: [],
  selectedMeshIds: [],
  loadedMeshGroups: [],
  scaleModelsBy: 0
})