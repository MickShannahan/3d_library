import mongoose from 'mongoose'
const Schema = mongoose.Schema

export const PartSchema = new Schema(
  {
    modelId: { type: Schema.Types.ObjectId, ref: 'Model', required: true },
    name: { type: String, required: true },
    stlBlobUrl: { type: String, required: true },
    previewImageUrl: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
    // NOTE If you wish to add additional properties do so here
  },
  { timestamps: true, toJSON: { virtuals: true } }
)
