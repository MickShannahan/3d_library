import { dbContext } from "../db/DbContext.js"
import { NotFound } from '../utils/Errors.js'

const MODEL_POPULATE = {
  path: 'models',
  populate: { path: 'modelId', select: 'name coverImage price' }
}

class OrdersService {

  async createOrder(orderData = {}) {
    const { models = [], ...orderFields } = orderData

    const lastOrder = await dbContext.Orders.findOne().sort('-orderNumber')
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 0

    const order = await dbContext.Orders.create({ ...orderFields, orderNumber: nextOrderNumber })

    if (models.length) {
      const modelOrderDocs = models.map((m, idx) => ({
        orderId: order._id,
        modelId: m.modelId,
        price: m.price ?? 0,
        scale: m.scale ?? 100,
        size: m.size,
        partIds: m.partIds ?? [],
        position: idx,
      }))
      await dbContext.ModelOrders.insertMany(modelOrderDocs)
    }

    return order.populate(MODEL_POPULATE)
  }

  async findOrders(query = {}) {
    return await dbContext.Orders.find(query).sort('orderNumber').populate(MODEL_POPULATE)
  }

  async findOrderById(orderId = '') {
    const order = await dbContext.Orders.findById(orderId).populate(MODEL_POPULATE)
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    return order
  }

  async updateOrder(orderId = '', updateData = {}) {
    const { models, ...orderFields } = updateData

    const order = await dbContext.Orders.findByIdAndUpdate(orderId, orderFields, { new: true })
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)

    if (models !== undefined) {
      await dbContext.ModelOrders.deleteMany({ orderId })
      if (models.length) {
        const modelOrderDocs = models.map((m, idx) => ({
          orderId: order._id,
          modelId: m.modelId,
          price: m.price ?? 0,
          scale: m.scale ?? 100,
          size: m.size,
          partIds: m.partIds ?? [],
          position: idx,
        }))
        await dbContext.ModelOrders.insertMany(modelOrderDocs)
      }
    }

    return order.populate(MODEL_POPULATE)
  }

  async updateBulk(orders = []) {
    const updates = orders.map(order => ({
      updateOne: {
        filter: { _id: order._id },
        update: { $set: order }
      }
    }))
    await dbContext.Orders.bulkWrite(updates)
    return this.findOrders()
  }

  async deleteOrder(orderId = '') {
    const order = await dbContext.Orders.findById(orderId)
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    await dbContext.ModelOrders.deleteMany({ orderId: order._id })
    await order.deleteOne()
    return `Order #${order.orderNumber} was deleted`
  }
}

export const ordersService = new OrdersService()
