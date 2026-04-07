import { AppState } from "@/AppState"
import { Author } from "@/models/Author"
import { api } from "./AxiosService"

class AuthorsService {
  async getAuthors() {
    const res = await api.get('api/authors')
    AppState.authors = res.data.map(a => new Author(a))
  }

  async createAuthor(authorData: { name: string, image: string }) {
    const res = await api.post('api/authors', authorData)
    const author = new Author(res.data)
    AppState.authors.push(author)
    return author
  }

  async deleteAuthor(authorId: string) {
    await api.delete(`api/authors/${authorId}`)
    const idx = AppState.authors.findIndex(a => a._id === authorId)
    if (idx !== -1) AppState.authors.splice(idx, 1)
  }
}

export const authorsService = new AuthorsService()
