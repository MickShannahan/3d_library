import { reactive } from "vue";
import { Model } from "./models/Model";
import { UUID } from "crypto";
import { PartMesh } from "./models/PartMesh";
import { PartGroup } from "./models/PartGroup";
import { Job } from "./models/Job";

interface AppState {
  meshGroups: Model[]
  selectedMeshIds: string[]
  loadedMeshGroups: string[]
  scaleModelsBy: 0,
  draggingMesh: PartMesh
  draggingFromPartGroup: PartGroup | null
  jobs: Job[]
}

export const AppState = reactive<AppState>({
  meshGroups: [],
  selectedMeshIds: [],
  loadedMeshGroups: [],
  scaleModelsBy: 0,
  draggingMesh: null,
  draggingFromPartGroup: null,
  jobs: []
})