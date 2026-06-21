import { AppState } from "@/AppState"
import { Order } from "@/models/Order"
import { api } from "./AxiosService"
import { imageUploadService } from "./ImageUploadService"
import { logger } from "@/utils/Logger"

interface CreateOrderPayload {
  models: { modelId: string; price: number; scale?: number; size?: number; partIds?: string[] }[]
  customerName?: string
  status?: string
  notes?: any[]
  partIds?: string[]
  paid?: boolean
  customerPaid?: boolean
  customerPrice?: number
  customerAddress?: string
  customerContacts?: any[]
  price?: number
}

class OrdersService {
  async getOrders() {
    const res = await api.get('api/orders')
    AppState.orders = res.data.map((o: any) => new Order(o))
  }

  async getOrderById(orderId: string) {
    const res = await api.get(`api/orders/${orderId}`)
    return new Order(res.data)
  }

  async uploadNoteAttachment(orderId: string, file: File): Promise<string> {
    const form = new FormData()
    form.append('images', file, file.name)
    const folderPath = `order/${orderId}/attachments`
    const uploadRes = await api.post(`upload/images?folder=${encodeURIComponent(folderPath)}`, form)
    return uploadRes.data[0]
  }

  async createOrder(orderData: CreateOrderPayload) {
    logger.log(orderData)
    const notesWithUpload = (orderData.notes ?? []).filter(n => n.attachmentImg?.url?.includes(window.origin))
    if (notesWithUpload.length) {
      for (const note of notesWithUpload) {
        note.attachmentImg.url = await this.uploadNoteAttachment('temp', note.attachmentImg.file as File)
      }
    }
    const res = await api.post('api/orders', orderData)
    const order = new Order(res.data)
    AppState.orders.push(order)
    return order
  }

  async updateOrder(orderId: string, orderData: Partial<CreateOrderPayload>) {
    const res = await api.put(`api/orders/${orderId}`, orderData)
    const order = new Order(res.data)
    const idx = AppState.orders.findIndex(o => o._id === orderId)
    if (idx !== -1) AppState.orders[idx] = order
    if (AppState.activeOrder?._id === orderId) AppState.activeOrder = order
    return order
  }

  async syncOrderNumbers(orders) {
    const stripped = orders.map(o => { return { _id: o.id, orderNumber: o.orderNumber } })
    await api.put(`api/orders/bulk`, stripped)
  }

  async deleteOrder(orderId: string) {
    await api.delete(`api/orders/${orderId}`)
    const idx = AppState.orders.findIndex(o => o._id === orderId)
    if (idx !== -1) AppState.orders.splice(idx, 1)
  }

  setActiveOrder(order: Order | null) {
    AppState.activeOrder = order
  }
}

export const ordersService = new OrdersService()
