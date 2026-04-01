import { reactive } from "vue";
import { MeshGroup } from "./models/MeshGroup";
import { UUID } from "crypto";
import { STLMesh } from "./models/STLMesh";
import { PartGroup } from "./models/PartGroup";

interface AppState {
  meshGroups: MeshGroup[]
  selectedMeshIds: string[]
  loadedMeshGroups: string[]
  scaleModelsBy: 0,
  draggingMesh: STLMesh
  draggingFromPartGroup: PartGroup | null
}

export const AppState = reactive<AppState>({
  meshGroups: [],
  selectedMeshIds: [],
  loadedMeshGroups: [],
  scaleModelsBy: 0,
  draggingMesh: null,
  draggingFromPartGroup: null
})