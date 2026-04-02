

export class MeshImage {
  data: string
  angle: number | string
  modelName: string
  type: string

  constructor(data) {
    this.data = data.data
    this.angle = data.angle
    this.modelName = data.modelName
    this.type = data.type
  }
}