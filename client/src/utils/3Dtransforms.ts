import { Box3, Mesh, Object3D, Vector3, Matrix4, Quaternion, Sphere } from "three";
import { logger } from "./Logger";
import { MeshGroup } from "@/models/MeshGroup";
import { STLMesh } from "@/models/STLMesh";


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

export function getModelCenter(...models: Object3D[]) {
  const box = new Box3()
  logger.log(models)
  models.forEach(m => box.expandByObject(m))
  return box.getCenter(new Vector3())
}

export function getModelZoom(model: MeshGroup | STLMesh, camera) {
  const zoomBox = new Box3()
  if (model instanceof MeshGroup) {
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

export function resetGroupBase(group: MeshGroup) {
  const combinedBox = new Box3()
  const matrix = new Matrix4().compose(
    new Vector3(),
    new Quaternion().setFromEuler(group.rotation),
    group.scale
  )

  group.meshes.forEach(m => {
    m.geometry.computeBoundingBox()
    const geomBox = m.geometry.boundingBox.clone()
    geomBox.applyMatrix4(matrix)
    combinedBox.union(geomBox)
  })

  group.position.y = -combinedBox.min.y
}
