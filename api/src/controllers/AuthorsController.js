import { authorsService } from "../services/AuthorsService.js"
import BaseController from "../utils/BaseController.js"

export class AuthorsController extends BaseController {
  constructor() {
    super('api/authors')
    this.router
      .get('', this.getAuthors)
      .post('', this.createAuthor)
      .delete('/:authorId', this.deleteAuthor)
  }

  async getAuthors(req, res, next) {
    try {
      const query = req.query ?? {}
      const authors = await authorsService.findAuthors(query)
      res.send(authors)
    } catch (error) {
      next(error)
    }
  }

  async createAuthor(req, res, next) {
    try {
      const author = await authorsService.createAuthor(req.body)
      res.send(author)
    } catch (error) {
      next(error)
    }
  }

  async deleteAuthor(req, res, next) {
    try {
      const authorId = req.params.authorId
      const deleteMessage = await authorsService.deleteAuthor(authorId)
      res.send({ message: deleteMessage })
    } catch (error) {
      next(error)
    }
  }
}
