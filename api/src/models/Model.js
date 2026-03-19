import mongoose from 'mongoose'
const Schema = mongoose.Schema

const PartGroupingSchema = new Schema({
  groupName: { type: String, required: true },
  required: { type: Boolean, default: false },
  parts: [
    {
      partId: { type: Schema.Types.ObjectId, ref: 'Part', required: true },
      name: { type: String, required: true }
    }
  ]
}, { _id: false })

export const ModelSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    defaultScale: { type: Number, default: 100 },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    partGroupings: [PartGroupingSchema]
    // NOTE If you wish to add additional properties do so here
  },
  { timestamps: true, toJSON: { virtuals: true } }
)
