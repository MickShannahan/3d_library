import { ordersService } from "../services/OrdersService.js"
import BaseController from "../utils/BaseController.js"

export class OrdersController extends BaseController {
  constructor() {
    super('api/orders')
    this.router
      .get('', this.getOrders)
      .post('', this.createOrder)
      .put('/bulk', this.updateBulk)
      .put('/:orderId', this.updateOrder)
      .delete('/:orderId', this.deleteOrder)
  }

  async getOrders(req, res, next) {
    try {
      const query = req.query ?? {}
      const orders = await ordersService.findOrders(query)
      res.send(orders)
    } catch (error) {
      next(error)
    }
  }

  async createOrder(req, res, next) {
    try {
      const body = req.body
      if (!Array.isArray(body.models) || body.models.length === 0) {
        return res.status(400).send({ message: 'An order must include at least one model.' })
      }
      const order = await ordersService.createOrder(body)
      res.send(order)
    } catch (error) {
      next(error)
    }
  }

  async updateOrder(req, res, next) {
    try {
      const orderId = req.params.orderId
      const order = await ordersService.updateOrder(orderId, req.body)
      res.send(order)
    } catch (error) {
      next(error)
    }
  }

  async updateBulk(req, res, next) {
    try {
      const orders = req.body
      res.send(await ordersService.updateBulk(orders))
    } catch (error) {
      next(error)
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const orderId = req.params.orderId
      const deleteMessage = await ordersService.deleteOrder(orderId)
      res.send({ message: deleteMessage })
    } catch (error) {
      next(error)
    }
  }
}
