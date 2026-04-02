import { reactive } from "vue";
import { Model } from "@/models/Model";
import { PartMesh } from "@/models/PartMesh";

interface CameraRef {
  snap360: (target: Model | PartMesh, zoom?: number, shots?: number) => Promise<void>
  pointCamera: (point: any) => void
  positionCamera: (position: any) => void
}

export const cameraState = reactive({
  isPanning: false,
  cameraRef: null as CameraRef | null
})