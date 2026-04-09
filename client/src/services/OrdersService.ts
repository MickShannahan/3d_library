import { AppState } from "@/AppState"
import { Order } from "@/models/Order"
import { api } from "./AxiosService"

class OrdersService {
  async getOrders() {
    const res = await api.get('api/orders')
    AppState.orders = res.data.map((o: any) => new Order(o))
  }

  async getOrderById(orderId: string) {
    const res = await api.get(`api/orders/${orderId}`)
    return new Order(res.data)
  }

  async createOrder(orderData: Partial<Order>) {
    const res = await api.post('api/orders', orderData)
    const order = new Order(res.data)
    AppState.orders.push(order)
    return order
  }

  async updateOrder(orderId: string, orderData: Partial<Order>) {
    const res = await api.put(`api/orders/${orderId}`, orderData)
    const order = new Order(res.data)
    const idx = AppState.orders.findIndex(o => o._id === orderId)
    if (idx !== -1) AppState.orders[idx] = order
    return order
  }

  async deleteOrder(orderId: string) {
    await api.delete(`api/orders/${orderId}`)
    const idx = AppState.orders.findIndex(o => o._id === orderId)
    if (idx !== -1) AppState.orders.splice(idx, 1)
  }
}

export const ordersService = new OrdersService()
