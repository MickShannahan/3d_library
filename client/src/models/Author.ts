import { generateId } from "@/utils/GenerateId"

export interface AuthorLink {
  name: string
  icon: string
  url: string
}

export class Author {
  _id: string
  name: string
  image: string
  socials: AuthorLink[]

  constructor(data) {
    this._id = data.id ?? data._id ?? generateId()
    this.name = data.name
    this.image = data.image
    this.socials = data.socials ?? data.links ?? [] as AuthorLink[]
  }

  get id() {
    return this._id
  }
}