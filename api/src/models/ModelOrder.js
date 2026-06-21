import { Schema } from "mongoose";

export const ModelOrderSchema = new Schema({
  orderId: { type: Schema.ObjectId, ref: 'Order', required: true },
  modelId: { type: Schema.ObjectId, ref: 'Model', required: true },
  price: { type: Number, min: 0, required: true, default: 0 },
  scale: { type: Number, min: 1, max: 500, default: 100 },
  size: { type: Number, min: 1 },
  partIds: [{ type: Schema.ObjectId, ref: 'Mesh' }],
  position: { type: Number, default: 0 },
}, { timestamps: true, toJSON: { virtuals: true } })

ModelOrderSchema.index({ orderId: 1, modelId: 1 }, { unique: true })
