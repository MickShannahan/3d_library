import { Box3, BufferGeometry, Object3D, Vector3, Sphere, Matrix4, Quaternion } from "three";
import { toRaw } from "vue";
import { logger } from "./Logger";
import { Model } from "@/models/Model";
import { PartMesh } from "@/models/PartMesh";

// Module-level WeakMaps — completely outside Vue's reactive system, never proxied
const geometryBoxCache = new WeakMap<BufferGeometry, Box3>()
type GroupBoxEntry = { box: Box3, rx: number, ry: number, rz: number, sx: number, sy: number, sz: number }
const groupBoxCache = new WeakMap<Model, GroupBoxEntry>()

function getGeometryBox(geometry: BufferGeometry): Box3 {
  if (!geometryBoxCache.has(geometry)) {
    geometry.computeBoundingBox()
    geometryBoxCache.set(geometry, geometry.boundingBox!.clone())
  }
  return geometryBoxCache.get(geometry)!
}

export function getGroupBox(group: Model | PartMesh): Box3 {
  const raw = toRaw(group) as Model
  const r = raw.rotation, s = raw.scale
  const box = new Box3()
  const matrix = new Matrix4().compose(new Vector3(), new Quaternion().setFromEuler(r), s)
  raw.meshes.forEach((m: PartMesh) => {
    const mRaw = toRaw(m)
    const geomBox = getGeometryBox(mRaw.geometry).clone()
    geomBox.applyMatrix4(matrix)
    const meshPosTransformed = new Vector3().copy(mRaw.position).applyMatrix4(matrix)
    geomBox.translate(meshPosTransformed)
    box.union(geomBox)
  })
  return box
}

export function getMeshBox(target: Model | PartMesh | Object3D[]): Box3 {
  if (target instanceof Model) {
    // For world space center (camera functions)
    const box = new Box3()
    target.meshes.forEach((m: PartMesh) => {
      box.expandByObject(toRaw(m))
    })
    return box
  } else if (target instanceof PartMesh) {
    const box = new Box3()
    box.setFromObject(target)
    return box
  } else {
    const box = new Box3()
    const meshArray = Array.isArray(target) ? target : [target]
    meshArray.forEach(m => box.expandByObject(m))
    return box
  }
}

export function getMeshesCenter(target: Model | PartMesh | Object3D[]): Vector3 {
  const box = getMeshBox(target)
  return box.getCenter(new Vector3())
}


export function rotate(degrees: number) {
  return degrees * (Math.PI / 180)
}

export function rotateVector3(degrees: Vector3 | number[]) {
  return new Vector3(
    (degrees.x || degrees[0]) * (Math.PI / 180),
    (degrees.y || degrees[1]) * (Math.PI / 180),
    (degrees.z || degrees[2]) * (Math.PI / 180)
  )
}

export function lerp(current: number, target: number, speed: number) {
  return current + (target - current) * speed
}


export function getModelZoom(model: Model | PartMesh, camera) {
  const zoomBox = new Box3()
  if (model instanceof Model) {
    model.meshes.forEach(m => zoomBox.expandByObject(m))
  } else {
    zoomBox.setFromObject(model)
  }
  const zoomSphere = zoomBox.getBoundingSphere(new Sphere())
  const zoomRadius = zoomSphere.radius
  const fovDegrees = camera.value.fov
  const fovRadians = fovDegrees * (Math.PI / 180)
  const zoomDistance = zoomRadius / Math.tan(fovRadians / 2)
  return zoomDistance
}

export function getModelBottom(...models: Object3D[]) {
  const box = new Box3()
  models.forEach(m => box.expandByObject(m))
  return box.min.y
}

export function resetGroupBase(group: Model) {
  const combinedBox = getGroupBox(group)
  group.position.y = -combinedBox.min.y
}
