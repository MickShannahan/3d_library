import { generateId } from "@/utils/GenerateId"


export class Author {
  _id: string
  name: string
  image: URL
  socials: []

  constructor(data) {
    this._id = data.id ?? data._id ?? generateId()
    this.name = data.name
    this.image = data.image
    this.socials = data.socials ?? []
  }

  get id() {
    return this._id
  }
}