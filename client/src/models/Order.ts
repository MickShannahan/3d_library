import { generateId } from "@/utils/GenerateId"

export interface OrderNote {
  body: string
  createdAt?: string
  updatedAt?: string
}

export interface CustomerContact {
  type: 'phone' | 'email' | 'discord' | 'etsy' | 'twitter' | 'bluesky'
  value: string
}

export class Order {
  _id: string
  orderNumber: number
  notes: OrderNote[]
  price: number
  status: 'pending' | 'hold' | 'printing' | 'shipped' | 'completed' | 'archived'
  paid: boolean
  modelScale: number
  modelSize: number
  customerName: string
  customerContacts: CustomerContact[]
  customerAddress: string
  customerPaid: boolean
  customerPrice: number
  modelId: string
  partIds: string[]

  constructor(data: any = {}) {
    this._id = data._id ?? generateId()
    this.orderNumber = data.orderNumber ?? 0
    this.notes = data.notes ?? []
    this.price = data.price ?? 0
    this.status = data.status ?? 'pending'
    this.paid = data.paid ?? false
    this.modelScale = data.modelScale ?? 100
    this.modelSize = data.modelSize ?? 0
    this.customerName = data.customerName ?? ''
    this.customerContacts = data.customerContacts ?? []
    this.customerAddress = data.customerAddress ?? ''
    this.customerPaid = data.customerPaid ?? false
    this.customerPrice = data.customerPrice ?? 0
    this.modelId = data.modelId ?? ''
    this.partIds = data.partIds ?? []
  }

  get id() {
    return this._id
  }
}
