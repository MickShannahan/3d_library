import mongoose from 'mongoose'
import { AccountSchema } from '../models/Account.js'
import { ValueSchema } from '../models/Value.js'
import { ModelSchema } from '../models/Model.js'
import { PartSchema } from '../models/Part.js'
import { OrderSchema } from '../models/Order.js'

class DbContext {
  Values = mongoose.model('Value', ValueSchema);
  Account = mongoose.model('Account', AccountSchema);
  Model = mongoose.model('Model', ModelSchema);
  Part = mongoose.model('Part', PartSchema);
  Order = mongoose.model('Order', OrderSchema);
}

export const dbContext = new DbContext()
