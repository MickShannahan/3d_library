import { Auth0Provider } from '@bcwdev/auth0provider'
import BaseController from '../utils/BaseController.js'
import { dbContext } from '../db/DbContext.js'

export class OrderController extends BaseController {
  constructor() {
    super('api/orders')
    this.router
      // NOTE: All routes require Authorization Bearer token
      .use(Auth0Provider.getAuthorizedUserInfo)
      .get('', this.getAllOrders)
      .get('/:id', this.getOrderById)
      .post('', this.createOrder)
      .put('/:id/status', this.updateOrderStatus)
      .put('/:id/priority', this.updateOrderPriority)
  }

  async getAllOrders(request, response, next) {
    try {
      const { status, limit = 50, skip = 0, sort = 'printOrder' } = request.query

      const filter = {}
      if (status) {
        filter.status = status
      }

      const orders = await dbContext.Order
        .find(filter)
        .populate('items.partId', 'name modelId')
        .populate('items.partId.modelId', 'name')
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .sort({ [sort]: 1, createdAt: -1 })

      const total = await dbContext.Order.countDocuments(filter)

      response.send({ data: orders, total, limit, skip })
    } catch (error) {
      next(error)
    }
  }

  async getOrderById(request, response, next) {
    try {
      const order = await dbContext.Order
        .findById(request.params.id)
        .populate('items.partId')
        .populate('items.partId.modelId', 'name category')

      if (!order) {
        return response.status(404).send({ error: 'Order not found' })
      }

      response.send(order)
    } catch (error) {
      next(error)
    }
  }

  async createOrder(request, response, next) {
    try {
      const { customerName, customerEmail, items, specialNotes } = request.body

      if (!customerName || !customerEmail || !items || items.length === 0) {
        return response.status(400).send({
          error: 'Missing required fields: customerName, customerEmail, items (non-empty array)'
        })
      }

      // Validate items and calculate total price
      let totalPrice = 0
      const validatedItems = []

      for (const item of items) {
        if (!item.partId || !item.quantity || !item.size || item.scale === undefined) {
          return response.status(400).send({
            error: 'Each item must have: partId, quantity, size, scale'
          })
        }

        const part = await dbContext.Part.findById(item.partId).populate('modelId')
        if (!part) {
          return response.status(404).send({ error: `Part not found: ${item.partId}` })
        }

        const itemPrice = part.modelId.price * (item.scale / 100) * item.quantity
        totalPrice += itemPrice

        validatedItems.push({
          partId: item.partId,
          quantity: item.quantity,
          size: item.size,
          scale: item.scale,
          price: itemPrice
        })
      }

      // Get next printOrder number
      const lastOrder = await dbContext.Order
        .findOne()
        .sort({ printOrder: -1 })
        .select('printOrder')

      const nextPrintOrder = (lastOrder?.printOrder || 0) + 1

      const newOrder = {
        customerName,
        customerEmail,
        items: validatedItems,
        totalPrice,
        printOrder: nextPrintOrder,
        specialNotes: specialNotes || '',
        status: 'queued',
        isPaid: false
      }

      const order = await dbContext.Order.create(newOrder)
      const populatedOrder = await order
        .populate('items.partId')
        .populate('items.partId.modelId', 'name category')

      response.status(201).send(populatedOrder)
    } catch (error) {
      next(error)
    }
  }

  async updateOrderStatus(request, response, next) {
    try {
      const { status, isPaid } = request.body
      const validStatuses = ['queued', 'printed', 'shipped']

      if (status && !validStatuses.includes(status)) {
        return response.status(400).send({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        })
      }

      const order = await dbContext.Order.findById(request.params.id)

      if (!order) {
        return response.status(404).send({ error: 'Order not found' })
      }

      if (status) order.status = status
      if (isPaid !== undefined) order.isPaid = isPaid
      if (status === 'shipped' && !order.shipDate) {
        order.shipDate = new Date()
      }

      await order.save()

      const updatedOrder = await order
        .populate('items.partId')
        .populate('items.partId.modelId', 'name category')

      response.send(updatedOrder)
    } catch (error) {
      next(error)
    }
  }

  async updateOrderPriority(request, response, next) {
    try {
      const { printOrder } = request.body

      if (printOrder === undefined || printOrder < 0) {
        return response.status(400).send({
          error: 'Invalid printOrder value'
        })
      }

      const order = await dbContext.Order.findById(request.params.id)

      if (!order) {
        return response.status(404).send({ error: 'Order not found' })
      }

      const oldOrder = order.printOrder
      order.printOrder = printOrder

      // If the new order is lower, shift other orders up
      if (printOrder < oldOrder) {
        await dbContext.Order.updateMany(
          { printOrder: { $gte: printOrder, $lt: oldOrder } },
          { $inc: { printOrder: 1 } }
        )
      } else {
        // If the new order is higher, shift other orders down
        await dbContext.Order.updateMany(
          { printOrder: { $gt: oldOrder, $lte: printOrder } },
          { $inc: { printOrder: -1 } }
        )
      }

      await order.save()

      const updatedOrder = await order
        .populate('items.partId')
        .populate('items.partId.modelId', 'name category')

      response.send(updatedOrder)
    } catch (error) {
      next(error)
    }
  }
}
