<script setup lang="ts">
import { useTres } from '@tresjs/core'
import { onMounted, onUnmounted, markRaw, watch } from 'vue'
import * as THREE from 'three'
import { toRaw } from 'vue'
import { AppState } from '@/AppState'
import { toolState } from '@/utils/ToolState'
import { cameraState } from '@/utils/CameraState'
import { getMeshBox } from '@/utils/3Dtransforms'
import { PartMesh } from '@/models/PartMesh'

const { camera, renderer } = useTres()

// PartMesh overrides raycast to a no-op; save the real Three.js prototype method
const meshRaycast = THREE.Mesh.prototype.raycast

// ─── Three.js objects added to the scene via <primitive> ─────────────────────
// axisGroup holds the constraint line (updated when axis lock changes)
// markerGroup holds the face-click point spheres
const axisGroup = markRaw(new THREE.Group())
const markerGroup = markRaw(new THREE.Group())

// ─── Pan-detection state ─────────────────────────────────────────────────────
// Records the cursor position on mousedown so we can tell whether the user
// dragged (panned) or genuinely clicked before the click event fires.
// (cameraState.isPanning is already false by the time 'click' is dispatched.)
let mouseDownClientX = 0
let mouseDownClientY = 0
const PAN_THRESHOLD_PX = 5   // pixels of movement that count as a pan

// ─── Grab mode state ─────────────────────────────────────────────────────────
// grabCenter: world-space center of the selection when G was pressed
let grabCenter = new THREE.Vector3()
// Camera-facing plane placed at grabCenter (used for free-move ray intersections)
let grabPlane = new THREE.Plane()
// World-space point under the cursor when G was pressed (free-move baseline)
let grabStartWorldPos = new THREE.Vector3()
// Original targetPosition of each selected mesh at grab start (restored on cancel)
let grabBasePositions = new Map<string, THREE.Vector3>()
// targetPosition snapshot when the current axis lock was set (axis-move baseline)
let axisBasePositions = new Map<string, THREE.Vector3>()
// Mouse NDC when the current axis constraint was set
let axisStartNDC = { x: 0, y: 0 }
// Last known mouse NDC (updated on every mousemove over the canvas)
let lastMouseNDC = { x: 0, y: 0 }

// ─── Face-move state ──────────────────────────────────────────────────────────
let facePoints: THREE.Vector3[] = []

// ─── Axis colours matching the X/Y/Z convention used in MeshToolsPane ────────
const AXIS_COLORS: Record<string, number> = { x: 0xff4444, y: 0x44cc44, z: 0x4488ff }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getNDC(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect()
  return {
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
  }
}

function getSelectedMeshes(): PartMesh[] {
  return AppState.meshGroups
    .flatMap(mg => mg.meshes)
    .filter(m => AppState.selectedMeshIds.includes(m._id))
}

// Returns the Model group that owns this PartMesh (for scale correction)
function getModelOf(mesh: PartMesh) {
  return AppState.meshGroups.find(mg => mg.meshes.includes(mesh)) ?? null
}

// Converts a world-space delta to the local space of a mesh's parent model group.
// targetPosition is relative to the model group's transform, so world deltas
// must be divided by model.scale (assuming no model-level rotation on STL imports).
function toLocalDelta(worldDelta: THREE.Vector3, mesh: PartMesh): THREE.Vector3 {
  const model = getModelOf(mesh)
  const scale = model ? toRaw(model).scale : new THREE.Vector3(1, 1, 1)
  return worldDelta.clone().divide(scale)
}

// Walk up from any scene object to find the THREE.Scene root.
function findSceneRoot(obj: THREE.Object3D): THREE.Object3D {
  let cur = obj
  while (cur.parent) cur = cur.parent
  return cur
}

function getIntersects(ndc: { x: number; y: number }): THREE.Intersection[] {
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera.value as THREE.PerspectiveCamera)
  const intersects: THREE.Intersection[] = []
  AppState.meshGroups.forEach(group => {
    group.meshes.forEach(mesh => {
      if (!mesh.visible) return
      meshRaycast.call(toRaw(mesh), raycaster, intersects)
    })
  })
  intersects.sort((a, b) => a.distance - b.distance)
  return intersects
}

// ─── Axis line ────────────────────────────────────────────────────────────────
function setAxisLine(axis: 'x' | 'y' | 'z' | null) {
  axisGroup.clear()
  if (!axis) return
  const dir = axis === 'x' ? new THREE.Vector3(1, 0, 0)
            : axis === 'y' ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(0, 0, 1)
  const p1 = grabCenter.clone().addScaledVector(dir, -1000)
  const p2 = grabCenter.clone().addScaledVector(dir, 1000)
  const geo = new THREE.BufferGeometry().setFromPoints([p1, p2])
  const mat = new THREE.LineBasicMaterial({ color: AXIS_COLORS[axis], depthTest: false })
  const line = new THREE.Line(geo, mat)
  line.renderOrder = 999
  axisGroup.add(line)
}

// ─── Face-click markers ───────────────────────────────────────────────────────
function addFaceMarker(point: THREE.Vector3) {
  const geo = new THREE.SphereGeometry(0.12, 10, 10)
  const mat = new THREE.MeshBasicMaterial({ color: 0xffdd00, depthTest: false })
  const sphere = new THREE.Mesh(geo, mat)
  sphere.position.copy(point)
  sphere.renderOrder = 999
  markerGroup.add(sphere)
}

function clearFaceMarkers() {
  markerGroup.clear()
  facePoints = []
  toolState.faceClickCount = 0
}

// ─── Grab mode ────────────────────────────────────────────────────────────────
function enterGrabMode(ndc: { x: number; y: number }) {
  const meshes = getSelectedMeshes()
  if (meshes.length === 0) return

  // Snapshot original positions
  grabBasePositions.clear()
  meshes.forEach(m => grabBasePositions.set(m._id, m.targetPosition.clone()))

  // World-space bounding center of the selection
  const box = getMeshBox(meshes as any)
  box.getCenter(grabCenter)

  // Camera-facing plane through the selection center
  const camDir = new THREE.Vector3()
  ;(camera.value as THREE.PerspectiveCamera).getWorldDirection(camDir)
  grabPlane.setFromNormalAndCoplanarPoint(camDir, grabCenter)

  // World position under cursor at grab start (free-move baseline)
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera.value as THREE.PerspectiveCamera)
  raycaster.ray.intersectPlane(grabPlane, grabStartWorldPos)

  axisBasePositions = new Map(grabBasePositions)
  axisStartNDC = { ...ndc }

  toolState.mode = 'grab'
  toolState.axisLock = 'none'
  setAxisLine(null)
}

function setAxisLock(axis: 'x' | 'y' | 'z') {
  // Snapshot current positions as the new baseline for this constraint so
  // switching axis doesn't jump the mesh back to the grab-start position.
  const meshes = getSelectedMeshes()
  axisBasePositions.clear()
  meshes.forEach(m => axisBasePositions.set(m._id, m.targetPosition.clone()))
  axisStartNDC = { ...lastMouseNDC }
  toolState.axisLock = axis
  setAxisLine(axis)
}

function applyGrabDelta(event: MouseEvent) {
  const ndc = getNDC(event)
  lastMouseNDC = ndc
  const speedMod = event.shiftKey ? 0.5 : 1
  const cam = camera.value as THREE.PerspectiveCamera
  const meshes = getSelectedMeshes()

  if (toolState.axisLock === 'none') {
    // Free move: ray-plane intersection against the camera-facing plane.
    // The intersection gives a world-space delta; convert to each mesh's model-local
    // space (divide by model.scale) before applying to targetPosition.
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), cam)
    const currentWorldPos = new THREE.Vector3()
    if (!raycaster.ray.intersectPlane(grabPlane, currentWorldPos)) return
    const worldDelta = currentWorldPos.clone().sub(grabStartWorldPos).multiplyScalar(speedMod)
    meshes.forEach(m => {
      const base = grabBasePositions.get(m._id)
      if (!base) return
      m.targetPosition.copy(base).add(toLocalDelta(worldDelta, m))
    })
  } else {
    // Axis-constrained: screen-projected axis technique.
    // Project the axis (1 world unit) onto screen space; ratio of screen-space
    // dot product to axis screen length gives world units moved along the axis.
    const axisVec = toolState.axisLock === 'x' ? new THREE.Vector3(1, 0, 0)
                  : toolState.axisLock === 'y' ? new THREE.Vector3(0, 1, 0)
                  : new THREE.Vector3(0, 0, 1)

    const centerNDC = grabCenter.clone().project(cam)
    const axisEndNDC = grabCenter.clone().add(axisVec).project(cam)
    const scrDir = new THREE.Vector2(axisEndNDC.x - centerNDC.x, axisEndNDC.y - centerNDC.y)
    const scrLen = scrDir.length()
    if (scrLen < 0.0001) return // Camera is looking directly along the axis

    const mouseDelta = new THREE.Vector2(ndc.x - axisStartNDC.x, ndc.y - axisStartNDC.y)
    const worldUnits = (mouseDelta.dot(scrDir.normalize()) / scrLen) * speedMod
    const worldDelta = axisVec.clone().multiplyScalar(worldUnits)

    meshes.forEach(m => {
      const base = axisBasePositions.get(m._id)
      if (!base) return
      m.targetPosition.copy(base).add(toLocalDelta(worldDelta, m))
    })
  }
}

function confirmGrab() {
  toolState.mode = 'none'
  toolState.axisLock = 'none'
}

function cancelGrab() {
  getSelectedMeshes().forEach(m => {
    const base = grabBasePositions.get(m._id)
    if (base) m.targetPosition.copy(base)
  })
  toolState.mode = 'none'
  toolState.axisLock = 'none'
}

// ─── Move-to-face mode ────────────────────────────────────────────────────────
function handleFaceClick(event: MouseEvent) {
  // Reject clicks that were really pan-releases (mousedown moved > threshold)
  const dx = event.clientX - mouseDownClientX
  const dy = event.clientY - mouseDownClientY
  if (Math.sqrt(dx * dx + dy * dy) > PAN_THRESHOLD_PX) return
  const ndc = getNDC(event)
  const intersects = getIntersects(ndc)
  if (intersects.length === 0) return

  const point = intersects[0].point.clone()

  if (facePoints.length === 0) {
    // First click: record source point and show a marker
    facePoints.push(point)
    addFaceMarker(point)
    toolState.faceClickCount = 1
  } else {
    // Second click: move selected meshes by the world-space delta converted to
    // each mesh's model-local coordinate space (account for model group scale).
    const worldDelta = point.clone().sub(facePoints[0])
    getSelectedMeshes().forEach(m => {
      const localDelta = toLocalDelta(worldDelta, m)
      m.targetPosition.x += localDelta.x
      m.targetPosition.y += localDelta.y
      m.targetPosition.z += localDelta.z
    })
    clearFaceMarkers()
    toolState.mode = 'none'
  }
}

// ─── Event handlers ───────────────────────────────────────────────────────────
function handleMouseDown(event: MouseEvent) {
  mouseDownClientX = event.clientX
  mouseDownClientY = event.clientY
}

function handleMouseMove(event: MouseEvent) {
  lastMouseNDC = getNDC(event)
  if (toolState.mode === 'grab') applyGrabDelta(event)
}

function handleCanvasClick(event: MouseEvent) {
  if (toolState.mode === 'grab') {
    confirmGrab()
  } else if (toolState.mode === 'move-to-face') {
    handleFaceClick(event)
  }
}

function handleCanvasRightClick(event: MouseEvent) {
  if (toolState.mode === 'grab') {
    event.preventDefault()
    cancelGrab()
  }
  // move-to-face is cancelled via Backspace/Esc only (right-click passes through)
}

function handleKeyDown(event: KeyboardEvent) {
  // Don't intercept keystrokes while typing in inputs
  const tag = (event.target as HTMLElement).tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

  if (toolState.mode === 'grab') {
    if (event.key === 'x' || event.key === 'X') { event.preventDefault(); setAxisLock('x'); return }
    if (event.key === 'y' || event.key === 'Y') { event.preventDefault(); setAxisLock('y'); return }
    if (event.key === 'z' || event.key === 'Z') { event.preventDefault(); setAxisLock('z'); return }
    if (event.key === 'Shift') return              // Shift = slow mode, stays in grab
    if (event.key === 'Escape') { cancelGrab(); return }
    confirmGrab()                                  // Any other key confirms
    return
  }

  if (toolState.mode === 'move-to-face') {
    if (event.key === 'Escape' || event.key === 'Backspace') {
      event.preventDefault()
      clearFaceMarkers()
      toolState.mode = 'none'
    }
    return
  }

  // Not in any tool mode
  if ((event.key === 'g' || event.key === 'G') && AppState.selectedMeshIds.length > 0) {
    event.preventDefault()
    enterGrabMode(lastMouseNDC)
    return
  }
  if ((event.key === 'f' || event.key === 'F') && AppState.selectedMeshIds.length > 0) {
    event.preventDefault()
    toolState.mode = 'move-to-face'
    toolState.faceClickCount = 0
  }
}

// ─── Reactive side-effects ────────────────────────────────────────────────────
watch(() => toolState.mode, (mode) => {
  // Clean up Three.js objects whenever a mode ends
  setAxisLine(null)
  if (mode !== 'move-to-face') clearFaceMarkers()

  // Cursor feedback
  if (!renderer?.domElement) return
  renderer.domElement.style.cursor =
    mode === 'grab'          ? 'move'       :
    mode === 'move-to-face'  ? 'crosshair'  :
    'default'
})

// ─── Center Model (runs here to access the Three.js scene graph) ─────────────
// Model is NOT in the scene graph itself — AnimatedGroup reads its position/scale
// and drives its own TresGroup. The PartMeshes ARE in the scene (via TresGroups).
// Strategy: walk up from a known PartMesh to find the scene, force updateMatrixWorld,
// compute world-space bbox from actual scene geometry, then shift model.position so
// the selection's center is at x=0, z=0 and the bottom lands at y=0.
function centerModelImpl() {
  const selectedMeshes = getSelectedMeshes()
  if (!selectedMeshes.length) return

  // Force world matrices to be fresh from the last-rendered (lerped) positions
  const rawFirst = toRaw(selectedMeshes[0])
  if (rawFirst.parent) {
    findSceneRoot(rawFirst).updateMatrixWorld(true)
  }

  // Find unique parent model groups
  const models = [...new Set(
    AppState.meshGroups.filter(mg => mg.meshes.some(m => AppState.selectedMeshIds.includes(m._id)))
  )]

  models.forEach(model => {
    const raw = toRaw(model)
    const box = new THREE.Box3()
    raw.meshes.forEach((m: PartMesh) => box.expandByObject(toRaw(m)))
    if (box.isEmpty()) return
    const center = box.getCenter(new THREE.Vector3())
    // Shift the model.position — AnimatedGroup will lerp to the new values
    raw.position.x -= center.x
    raw.position.y -= box.min.y
    raw.position.z -= center.z
  })
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  toolState.centerModel = centerModelImpl
  renderer.domElement.addEventListener('mousedown', handleMouseDown)
  renderer.domElement.addEventListener('mousemove', handleMouseMove)
  renderer.domElement.addEventListener('click', handleCanvasClick)
  renderer.domElement.addEventListener('contextmenu', handleCanvasRightClick)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  toolState.centerModel = null
  renderer.domElement.removeEventListener('mousedown', handleMouseDown)
  renderer.domElement.removeEventListener('mousemove', handleMouseMove)
  renderer.domElement.removeEventListener('click', handleCanvasClick)
  renderer.domElement.removeEventListener('contextmenu', handleCanvasRightClick)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <!-- axisGroup and markerGroup are plain Three.js Groups managed imperatively.
       Tres adds them to the scene on mount; we add/remove children via Three.js API. -->
  <primitive :object="axisGroup" />
  <primitive :object="markerGroup" />
</template>
