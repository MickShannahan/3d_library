import { reactive } from 'vue'

export type ToolMode = 'none' | 'grab' | 'move-to-face'
export type AxisLock = 'none' | 'x' | 'y' | 'z'

export const toolState = reactive<{
  mode: ToolMode
  axisLock: AxisLock
  faceClickCount: number  // 0 = waiting for first click, 1 = waiting for second
  // Set by SceneToolHandler (which has Tres context); called by MeshToolsPane
  centerModel: (() => void) | null
}>({
  mode: 'none',
  axisLock: 'none',
  faceClickCount: 0,
  centerModel: null,
})
