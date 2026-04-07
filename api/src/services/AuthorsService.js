import { NotFound } from "@bcwdev/auth0provider/lib/Errors.js"
import { dbContext } from "../db/DbContext.js"

class AuthorsService {
  async createAuthor(authorData = {}) {
    return await dbContext.Authors.create(authorData)
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
}

export const authorsService = new AuthorsService()
