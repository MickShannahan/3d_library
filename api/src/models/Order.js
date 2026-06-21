import { Schema } from "mongoose";

const NoteAttachmentSchema = new Schema({
  url: { type: String },
  name: { type: String }
})

const OrderNoteSchema = new Schema({
  body: { type: String, minlength: 1, maxlength: 500 },
  attachmentImg: { type: NoteAttachmentSchema }
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
  paid: { type: Boolean, default: false },
  modelScale: { type: Number, min: 0, default: 100 },
  modelSize: { type: Number, min: 1 },
  customerName: { type: String },
  customerContacts: [ContactSchema],
  customerAddress: { type: String },
  customerPaid: { type: Boolean, default: false },
  customerPrice: { type: Number, min: 0 },

  partIds: [{ type: Schema.ObjectId }],
}, { timestamps: true, toJSON: { virtuals: true } })

OrderSchema.virtual('models', {
  ref: 'ModelOrder',
  localField: '_id',
  foreignField: 'orderId',
  options: { sort: { position: 1 } }
})