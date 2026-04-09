import { NotFound } from "@bcwdev/auth0provider/lib/Errors.js"
import { dbContext } from "../db/DbContext.js"

class OrdersService {
  async createOrder(orderData = {}) {
    return await dbContext.Orders.create(orderData)
  }

  async findOrders(query = {}) {
    return await dbContext.Orders.find(query).populate('model')
  }

  async findOrderById(orderId = '') {
    const order = await dbContext.Orders.findById(orderId).populate('model')
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    return order
  }

  async updateOrder(orderId = '', updateData = {}) {
    const order = await dbContext.Orders.findByIdAndUpdate(orderId, updateData, { new: true }).populate('model')
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    return order
  }

  async deleteOrder(orderId = '') {
    const order = await dbContext.Orders.findById(orderId)
    if (!order) throw new NotFound(`No Order with id: ${orderId}`)
    await order.deleteOne()
    return `Order #${order.orderNumber} was deleted`
  }
}

export const ordersService = new OrdersService()
