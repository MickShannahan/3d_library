import { dbContext } from "../db/DbContext.js"
import { NotFound } from '../utils/Errors.js'

class OrdersService {

  async createOrder(orderData = {}) {
    const lastOrder = await dbContext.Orders.findOne().sort('-orderNumber')
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 0
    return await dbContext.Orders.create({ ...orderData, orderNumber: nextOrderNumber })
  }

  async findOrders(query = {}) {
    return await dbContext.Orders.find(query).sort('orderNumber').populate('model', 'name coverImage')
  }

  async findOrderById(orderId = '') {
    const order = await dbContext.Orders.findById(orderId).populate('model')
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    return order
  }

  async updateOrder(orderId = '', updateData = {}) {
    const order = await dbContext.Orders.findByIdAndUpdate(orderId, updateData, { new: true }).populate('model', 'name coverImage')
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    return order
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
    await order.deleteOne()
    return `Order #${order.orderNumber} was deleted`
  }
}

export const ordersService = new OrdersService()
