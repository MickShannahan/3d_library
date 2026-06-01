import { NotFound } from '../utils/Errors.js'
import { dbContext } from "../db/DbContext.js"

class AuthorsService {
  async createAuthor(authorData = {}) {
    const allowed = {
      name: authorData.name,
      image: authorData.image,
      links: authorData.socials ?? authorData.links ?? []
    }
    return await dbContext.Authors.create(allowed)
  }

  async findAuthors(query = {}) {
    return await dbContext.Authors.find(query)
  }

  async findAuthorById(authorId = '') {
    const author = await dbContext.Authors.findById(authorId)
    if (!author) throw new NotFound(`No Author with id: ${authorId}`)
    return author
  }

  async deleteAuthor(authorId = '') {
    const author = await dbContext.Authors.findById(authorId)
    if (!author) throw new NotFound(`No Author with id: ${authorId}`)
    await author.deleteOne()
    return `${author.name} was deleted`
  }

  async updateAuthor(authorId = '', updateData = {}) {
    await this.findAuthorById(authorId)
    const allowed = {
      name: updateData.name,
      image: updateData.image,
      links: updateData.socials ?? updateData.links ?? []
    }
    return await dbContext.Authors.findByIdAndUpdate(authorId, allowed, { new: true, runValidators: true })
  }
}

export const authorsService = new AuthorsService()
