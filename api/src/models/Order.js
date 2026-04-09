import { Schema } from "mongoose";

const OrderNoteSchema = new Schema({
  body: { type: String, minlength: 1, maxlength: 500 }
}, { timestamps: true })

const ContactSchema = new Schema({
  type: { type: String, enum: ['phone', 'email', 'discord', 'etsy', 'twitter', 'bluesky'] },
  value: { type: String }
})

export const OrderSchema = new Schema({
  orderNumber: { type: Number, default: 0 },
  notes: [OrderNoteSchema],
  price: { type: Number, min: 0 },
  status: { type: String, enum: ['pending', 'hold', 'printing', 'shipped', 'completed', 'archived'] },
  paid: { type: Boolean, defualt: false },
  modelScale: { type: Number, min: 0, default: 100 },
  modelSize: { type: Number, min: 1 },
  customerName: { type: String },
  customerContacts: [ContactSchema],
  customerAddress: { type: String },
  customerPaid: { type: Boolean, default: false },
  customerPrice: { type: Number, min: 0 },

  modelId: { type: Schema.ObjectId },
  partIds: [{ type: Schema.ObjectId }],
}, { timestamps: true, toJSON: { virtuals: true } })

OrderSchema.virtual('model', {
  localField: 'modelId',
  ref: 'Model',
  foreignField: '_id',
  justOne: true,
})