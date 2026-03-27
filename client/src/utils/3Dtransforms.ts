import { Vector3 } from "three";


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