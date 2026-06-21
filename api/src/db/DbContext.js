import mongoose from 'mongoose'
import { AccountSchema } from '../models/Account.js'
import { AuthorSchema } from '../models/Author.js'
import { ModelSchema } from '../models/Model.js';
import { ModelOrderSchema } from '../models/ModelOrder.js';
import { OrderSchema } from '../models/Order.js';

class DbContext {
  Account = mongoose.model('Account', AccountSchema);

  Models = mongoose.model('Model', ModelSchema)

  Authors = mongoose.model('Author', AuthorSchema)

  Orders = mongoose.model('Order', OrderSchema)

  ModelOrders = mongoose.model('ModelOrder', ModelOrderSchema)
}

export const dbContext = new DbContext()
