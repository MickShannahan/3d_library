import mongoose from 'mongoose'
import { AccountSchema } from '../models/Account.js'
import {AuthorSchema} from '../models/Author.js'
import { ModelSchema } from '../models/Model.js';

class DbContext {
  Account = mongoose.model('Account', AccountSchema);

  Models = mongoose.model('Model', ModelSchema)

  Authors = mongoose.model('Author', AuthorSchema)
}

export const dbContext = new DbContext()
