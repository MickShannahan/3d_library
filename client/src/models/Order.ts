import { generateId } from "@/utils/GenerateId"
import { Model } from "./Model"
import { AppState } from "@/AppState"


export const STATUS_COLORS: Record<string, string> = {
  pending: 'info',
  hold: 'warning',
  printing: 'normal',
  shipped: 'normal-y',
  completed: 'success',
  archived: 'orange',
}

export const STATUS_ICONS: Record<string, string> = {
  pending: 'mdi-clock-outline',
  hold: 'mdi-pause-circle-outline',
  printing: 'mdi-printer-3d',
  shipped: 'mdi-truck-outline',
  completed: 'mdi-check-circle',
  archived: 'mdi-archive-outline',
}

export const CONTACT_ICONS: Record<string, string> = {
  phone: 'mdi-phone-outline',
  email: 'mdi-email-outline',
  discord: 'mdi-discord',
  etsy: 'mdi-storefront-outline',
  twitter: 'mdi-twitter',
  bluesky: 'mdi-butterfly-outline',
}


export interface AttachmentImg {
  file?: Blob,
  url?: string,
  name?: string,
}

export interface OrderNote {
  body: string
  attachmentImg?: AttachmentImg
  createdAt?: string
  updatedAt?: string
}

export class CustomerContact {

  type: 'phone' | 'email' | 'discord' | 'etsy' | 'twitter' | 'bluesky'
  value: string
  constructor(data) {
    this.type = data.type ?? 'email'
    this.value = data.value ?? ''
  }

  get contactIcon() {
    return CONTACT_ICONS[this.type]
  }
}

/** Represents one row in the ModelOrder junction collection (populated from the API) */
export interface ModelOrderEntry {
  _id: string
  orderId: string
  /** Populated model data or just an id string when unpopulated */
  modelId: Model | string
  price: number
  scale: number
  size?: number
  partIds: string[]
  position: number
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
  /** Junction entries from the ModelOrder collection, sorted by position */
  models: ModelOrderEntry[]
  partIds: string[]
  createdAt: Date
  updatedAt: Date

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
    this.customerContacts = data.customerContacts as CustomerContact[] ?? []
    this.customerAddress = data.customerAddress ?? ''
    this.customerPaid = data.customerPaid ?? false
    this.customerPrice = data.customerPrice ?? 0
    this.models = data.models ?? []
    this.partIds = data.partIds ?? []
    this.createdAt = new Date(data.createdAt)
    this.updatedAt = new Date(data.updatedAt)
  }

  /** Returns the full Model objects from AppState, merged with the price from the junction entry */
  get modelsData(): (Model & { orderPrice: number })[] {
    return this.models.map(entry => {
      const populated = entry.modelId as Model
      const model = (populated?._id)
        ? populated
        : AppState.models.find(m => m._id === (entry.modelId as string))
      return model ? Object.assign(Object.create(Object.getPrototypeOf(model)), model, { orderPrice: entry.price }) : null
    }).filter(Boolean)
  }

  /** Convenience: first model (for single-model contexts) */
  get model(): Model | undefined {
    return this.modelsData[0]
  }

  /** Sum of all per-model prices in this order */
  get orderTotal(): number {
    return this.models.reduce((sum, entry) => sum + (entry.price ?? 0), 0)
  }

  get statusColor() {
    return STATUS_COLORS[this.status]
  }

  get statusIcon() {
    return STATUS_ICONS[this.status]
  }

  get id() {
    return this._id
  }

  get createdAtFormatted() {
    return this.createdAt.toLocaleDateString('en-us', { month: 'short', weekday: 'short', day: 'numeric', year: '2-digit' })
  }

  static STATUS_OPTIONS = ['pending', 'hold', 'printing', 'shipped', 'completed', 'archived']
}
