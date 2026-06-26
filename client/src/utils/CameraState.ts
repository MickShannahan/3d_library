import { reactive } from "vue";
import { Model } from "@/models/Model";
import { PartMesh } from "@/models/PartMesh";
import defaultBackground from '../assets/img/blurryBgLowSm.gif'

interface CameraRef {
  snap360: (target: Model | PartMesh, shots?: number, hideAllMeshes?: boolean) => Promise<void>
  pointCamera: (point: any) => void
  positionCamera: (position: any) => void
}

export const cameraState = reactive({
  isPanning: false,
  showGrid: true,
  showAxis: true,
  cameraRef: null as CameraRef | null,
  clearColor: '#16161d',
  background: defaultBackground,
  showBackground: true,
  selectedMaterial: 'Studio Default'
})