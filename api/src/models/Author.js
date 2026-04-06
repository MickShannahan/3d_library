import { Schema } from "mongoose";

const LinkSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  icon: { type: String, required: true, defualt: 'mdi-link-variant' },
  url: { type: String, maxlength: 400 }
})

export const AuthorSchema = new Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  image: { type: String, required: true, maxlength: 400 },
  links: [{ type: LinkSchema }]
}, { timestamps: true })