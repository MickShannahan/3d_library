import mongoose from 'mongoose'
import { AccountSchema } from '../models/Account.js'
import { ModelSchema } from '../models/Model.js';

class DbContext {
  Account = mongoose.model('Account', AccountSchema);

  Models = mongoose.model('Model', ModelSchema)
}

export const dbContext = new DbContext()
