import { Schema } from "mongoose";

const PartMeshSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  src: { type: String, required: true },
  images: [{ type: String }]
})

const PartGroupSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  partIds: [{ type: Schema.ObjectId }],
  defaultPartId: { type: Schema.ObjectId }
})

export const ModelSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  meshes: [{ type: PartMeshSchema }],
  partGroups: [{ type: PartGroupSchema }],
  coverImage: { type: String },
  turnAroundImage: { type: String }
  images: [{ type: String }]
}, { timestamps: true, toJSON: { virtuals: true } })