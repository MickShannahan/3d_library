import { Schema } from "mongoose";

const RenderedPreviewSchema = new Schema({
  url: { type: String, required: true },
  title: { type: String, default: '' }
})

const MeshImageSchema = new Schema({
  data: String,
  angle: String,
  modelName: String,
  type: String
})

const PartMeshSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  src: { type: String, required: true },
  bytes: { type: Number, default: 0, min: 0 },
  images: [{ type: MeshImageSchema }]
})

const PartGroupSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  partIds: [{ type: Schema.ObjectId }],
  defaultPartId: { type: Schema.ObjectId },
})

export const ModelSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  meshes: [{ type: PartMeshSchema }],
  partGroups: [{ type: PartGroupSchema }],
  coverImage: { type: String },
  turnAroundImage: { type: String },
  images: [{ type: String }],
  author: { type: Schema.ObjectId, ref: 'Author', required: false },
  tags: [{ type: String, maxlength: 25, lowercase: true }],
  price: { type: Number, default: 0, min: 0 },
  adjustedScale: { type: Number, default: 1, min: 0 },
  size: { type: Number, default: 0, min: 0 },
  bytes: { type: Number, default: 0, min: 0 },
  notes: { type: String, default: '' },
  renderedPreviews: [{ type: RenderedPreviewSchema }]
}, { timestamps: true, toJSON: { virtuals: true } })