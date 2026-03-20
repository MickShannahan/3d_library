import mongoose from 'mongoose'
const Schema = mongoose.Schema

const OrderItemSchema = new Schema({
  partId: { type: Schema.Types.ObjectId, ref: 'Part', required: true },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, required: true },
  scale: { type: Number, required: true, default: 100, min: 1, max: 100 },
  price: { type: Number, required: true, min: 0 }
}, { _id: true })

export const OrderSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true, min: 0 },
    printOrder: { type: Number, required: true, default: 0 },
    specialNotes: { type: String },
    status: { type: String, enum: ['queued', 'printed', 'shipped'], default: 'queued' },
    isPaid: { type: Boolean, default: false },
    shipDate: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true } }
)
